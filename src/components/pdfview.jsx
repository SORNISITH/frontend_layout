// npm install pdfjs-dist --save-dev
//@mui   clsx  react react-router  motion
import { Button, LinearProgress } from "@mui/material";
import { motion } from "motion/react";
//---------------------------------------------------------------------
import { Routes, Route, useNavigate } from "react-router";
import NoteFound from "@/pages/404";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, createRef, useCallback } from "react";
import clsx from "clsx";
///cdn worker

const ResponsiveLayout = ({ children }) => {
  return (
    <div className="2xl:w-[50%] xl:w-[65%] lg:w-[80%] md:w-[99%] h-full w-[100%] bg-zinc-100  ">
      {children}
    </div>
  );
};

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

class PDF_JS_DIST {
  constructor() {
    this.lip = pdfjsLib;
    this.pdf = null;
    this.page = new Map();

    // fix error render canvas
    this.pageRendering = false;
  }
  async loadPdf(_url) {
    if (!this.lip) return;
    info("fetching ... pdf : " + _url);
    try {
      this.pdf = await this.lip.getDocument(_url).promise;
      info("fetching done!");
    } catch (error) {
      err("=> error obj load pdf : " + error);
    }
  }

  async loadPage(number) {
    const page = number || 1;
    try {
      info("Loading page ... : ", page);
      const resultLoadPage = await this.pdf.getPage(page);
      this.page.set(page, resultLoadPage);
    } catch (error) {
      err("=> error obj load page : " + error);
    }
  }

  //TODO :Error
  async renderPageSvg(canvasRef, pageNumber, scale, rotation) {
    try {
      if (this.pageRendering) {
        warn("render engine task pending page: " + pageNumber);
        return;
      } else {
        info("start rendering page : " + pageNumber);
        this.pageRendering = true;
        const _svgElement = canvasRef.current;
        const _page = pageNumber || 1;
        const _scale = scale || 1;
        const _rotation = rotation || 0;
        const viewport = await this.page
          ?.get(_page)
          ?.getViewport({ scale: _scale, rotation: _rotation });

        // if (!(_svgElement instanceof HTMLCanvasElement)) {
        //   err("Stored object is NOT a valid <canvas> element!", _svgElement);
        // }
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svg.setAttibute("width", viewport.height || 1);
        svg.setAttibute("height", viewport.width || 1);
        const PAGEOBJ = this.page.get(_page);
        const renderTask = PAGEOBJ.getOperatorList().then(async (ops) => {
          const svgGfx = new pdfjsLib.SVGGraphics(
            PAGEOBJ.commonObjs,
            PAGEOBJ.objs,
          );
          const svgOps = await svgGfx.getSVG(ops, viewport);
          svg.appendChild(svgOps);
          _svgElement.innerHtml = "";
          _svgElement.appendChild(svg);
        });
        await renderTask.promise;
        info("finish render page : " + _page);
        this.pageRendering = false;
      }
    } catch (error) {
      err(error);
    }
  }
  async load_render_canvas(canvas, pageNumber, scale, rotation) {
    if (!this?.pdf) return;
    await this?.loadPage(pageNumber);
    await this?.renderPage(canvas, pageNumber, scale, rotation);
  }

  async renderPage(canvasRef, pageNumber, scale, rotation) {
    try {
      if (this.pageRendering) {
        warn("render engine task pending page: " + pageNumber);
        return;
      } else {
        info("start rendering page : " + pageNumber);
        this.pageRendering = true;
        const _canvas = canvasRef.current;
        const _page = pageNumber || 1;
        const _scale = scale || 1;
        const _rotation = rotation || 0;
        const viewport = await this.page
          ?.get(_page)
          ?.getViewport({ scale: _scale, rotation: _rotation });
        const context = _canvas?.getContext("2d");
        context.clearRect(0, 0, _canvas?.width, _canvas?.height); // Clear the entire canvas

        if (!(_canvas instanceof HTMLCanvasElement)) {
          err("Stored object is NOT a valid <canvas> element!", _canvas);
        }
        _canvas.height = viewport.height || 1;
        _canvas.width = viewport.width || 1;
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = this.page.get(_page).render(renderContext);
        await renderTask.promise;
        info("finish render page : " + _page);
        this.drawPage(context, _canvas, _page);
        this.pageRendering = false;
      }
    } catch (error) {
      err(error);
    }
  }

  drawPage(context, _canvas, _page) {
    // Draw the page number at the bottom-center
    const text = `Page : ${_page}`;
    const textWidth = context.measureText(text).width;
    const textHeight = 16; // Font size
    const centerX = _canvas.width / 2;
    const bottomY = _canvas.height - 30; // 20px from the bottom

    // Draw the background (rounded white square)
    const padding = 15;
    context.fillStyle = "white";
    context.beginPath();
    context.moveTo(
      centerX - textWidth / 2 - padding,
      bottomY - textHeight / 2 - padding,
    );
    context.lineTo(
      centerX + textWidth / 2 + padding,
      bottomY - textHeight / 2 - padding,
    );
    context.lineTo(
      centerX + textWidth / 2 + padding,
      bottomY + textHeight / 2 + padding,
    );
    context.lineTo(
      centerX - textWidth / 2 - padding,
      bottomY + textHeight / 2 + padding,
    );
    context.closePath();
    context.fill();

    // Draw the text (black color)
    context.fillStyle = "black";
    context.font = "16px Arial"; // Font size
    context.textAlign = "center";
    context.fillText(text, centerX, bottomY + 10);
  }
  get totalPage() {
    return this.pdf?._pdfInfo?.numPages;
  }
}

//WARNING :
/// global this for fix render canvas error
//-------------------------------------------------------------------------------
const PDF = new PDF_JS_DIST();

function pdfViewCallViewPdf(mState) {
  const {
    canvasStoreRef,
    url,
    pageIndex,
    pageScale,
    pageRotation,
    pageTotalCount,
    isPdfReady,
    triggerRerenderS2,
    triggerRerenderS3,
    triggerRerenderNextPage,
    triggerDefaultJumpPage,
    setUrl,
    setPageIndex,
    setPageScale,
    setPageRotation,
    setPdfReady,
    setPageTotalCount,
    setCanvasStoreArrayRef,
    setTriggerRerenderS2,
    setTriggerRerenderS3,
    setTriggerRerenderNextPage,
    setDisableObserver,
    setTriggerDefaultJumpPage,
    DEFAULT_PAGE_VIEW,
    disableObserver,
  } = mState;

  const S1_FETCHPDF = async () => {
    if (!url) return;
    setPdfReady(() => false);
    localStorage.setItem("url", url);
    const ADDRESS = "http://localhost:5173/";
    const getResponse = await fetch(`${ADDRESS}${_url}`);
    const blob = await getResponse.blob();
    const pdfUrl = URL.createObjectURL(blob);
    await PDF?.loadPdf(pdfUrl);
    // setPdfSize(() => blob.size);
    setPdfReady(() => true);
    setTriggerRerenderS2(() => !triggerRerenderS2);
  };

  const S1_GETPDF = async () => {
    if (!url) return;
    setPdfReady(() => false);
    localStorage.setItem("url", url);
    // async function converToBlob() {
    //   const ADDRESS = "http://localhost:5173/";
    //   const getResponse = await fetch(`${ADDRESS}${_url}`);
    //   const blob = await getResponse.blob();
    //   const pdfUrl = URL.createObjectURL(blob);
    //   await PDF?.loadPdf(pdfUrl);
    //   // setPdfSize(() => blob.size);
    // }
    await PDF?.loadPdf(url);
    setPdfReady(() => true);
    setTriggerRerenderS2(() => !triggerRerenderS2);
  };
  const S2_loadCanvas = async () => {
    if (!isPdfReady) return info("S2_loadCanvas pending  processing pdf");
    if (!PDF?.pdf) return info("S2_loadCanvas pdf is not yet loaded");
    let _totalPage = Number() < 6 ? 6 : pageTotalCount;
    info("S2_loadCanvas : " + _totalPage);
    if (!_totalPage) return;
    setCanvasStoreArrayRef(() => {
      const newArr = [];
      for (let i = 1; i <= _totalPage; i++) {
        newArr.push(createRef());
      }
      return newArr;
    });
    setTriggerRerenderS3(() => !triggerRerenderS3);
  };
  const S2_createNextCanvas = () => {
    setCanvasStoreArrayRef((prev) => [...prev, createRef()]);
    setTriggerRerenderNextPage(() => !triggerRerenderNextPage);
    info("S2_createNextanvas created 1 canvas ");
  };
  const S3_renderAllPage = async () => {
    if (!isPdfReady) return info("S3_renderAllPage pending Processing pdf");
    if (!PDF?.pdf)
      return info("S3_renderAllPage checking is pdf already loaded ?");
    info("S3_renderAllCanvas : ", canvasStoreRef);
    for (let i = 1; i <= canvasStoreRef?.length; i++) {
      await PDF.load_render_canvas(
        canvasStoreRef[i - 1],
        i,
        pageScale,
        pageRotation,
      );
    }
    setDisableObserver(() => true);
    setTriggerDefaultJumpPage(() => !triggerDefaultJumpPage);
  };
  const S3_renderNextPage = async () => {
    if (!isPdfReady) return info("S3_renderNextPage pending Processing pdf");
    if (!PDF?.pdf)
      return info("S3_renderNextPage checking is pdf already loaded ?");
    if (!canvasStoreRef) return info("S3_renderNextgpage fn required array");
    const page = canvasStoreRef?.length;
    info("S3_renderNextPage : ", page);
    await PDF.load_render_canvas(
      canvasStoreRef[page - 1],
      page,
      pageScale,
      pageRotation,
    );
  };
  const jumpToPage = (target) => {
    const _target = Number(target) || 1;
    if (!_target) return info("@param 1 target not defined");
    if (pageTotalCount < pageIndex) {
      info("page view bigger");
    } else {
      canvasStoreRef[_target]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const lazyLoadNextPageOBS = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          S2_createNextCanvas();
          lazyLoadNextPageOBS.unobserve(entry.target);
        }
      });
    },
    {
      root: document.getElementById("obs_root"),
      rootMargin: "100px", // No margin around the root
      threshold: 0.3,
    },
  );
  const setDefaultPage = () => {
    localStorage.setItem("default_page_total", canvasStoreRef.length);
  };

  const lazyLoadNextPage = () => {
    if (!canvasStoreRef) return;
    if (canvasStoreRef?.length <= 5) return;
    const watchPage = canvasStoreRef[canvasStoreRef.length - 2].current;
    lazyLoadNextPageOBS?.observe(watchPage);
    // canvasArray.forEach((element) => obs.observe(element?.current));
  };

  return {
    S1_FETCHPDF,
    S1_GETPDF,
    S2_loadCanvas,
    S2_createNextCanvas,
    S3_renderAllPage,
    S3_renderNextPage,
    jumpToPage,
    lazyLoadNextPage,
    setDefaultPage,
  };
}
function PdfStartEngine({ mState }) {
  const pdfViewCall = pdfViewCallViewPdf(mState);

  useEffect(() => {
    pdfViewCall.S1_GETPDF(); //
  }, [mState.url]);
  useEffect(() => {
    pdfViewCall.S2_loadCanvas();
  }, [mState.triggerRerenderS2, mState.pageTotalCount]);
  useEffect(() => {
    pdfViewCall.S3_renderAllPage();
  }, [mState.triggerRerenderS3, mState.pageScale, mState.pageRotation]);
  useEffect(() => {
    pdfViewCall.S3_renderNextPage();
  }, [mState.triggerRerenderNextPage]);
  useEffect(() => {
    pdfViewCall.jumpToPage(mState.DEFAULT_PAGE_VIEW);
  }, [mState.triggerDefaultJumpPage]);
  useEffect(() => {
    pdfViewCall.jumpToPage(mState.pageIndex);
  }, [mState.pageIndex]);
  useEffect(() => {
    pdfViewCall.setDefaultPage();
    pdfViewCall.lazyLoadNextPage();
  }, [mState.canvasStoreRef]);
}
function PdfViewEngine({ mState }) {
  const scrollRef = useRef(null);

  return (
    <motion.div
      key="pdfview/main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[100%] h-[100%]  flex flex-col items-center  overflow-hidden "
    >
      <ResponsiveLayout>
        <div className="w-full h-[7%]  shadow-md ">
          <Dashboard isPageLoaded={mState.isPdfReady} />
        </div>
        <div
          ref={scrollRef}
          id="obs_root"
          className=" gap-1   h-[93%] w-[100%]  flex flex-col  no-scrollbar shadow-sm items-center    scroll-smooth  overflow-auto "
        >
          {mState.canvasStoreRef?.map((ref, index) => (
            <motion.canvas
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.1,
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              // viewport={{ root: scrollRef }}
              data-index={index + 1}
              id={`canvas-${index + 1}`}
              key={index + 1}
              ref={ref}
              className={clsx(" w-[100%]   shadow-md ")}
            ></motion.canvas>
          ))}
        </div>
      </ResponsiveLayout>
    </motion.div>
  );
}

const Dashboard = ({ isPageLoaded, changeUrl }) => {
  const navigate = useNavigate();
  return (
    <div className="w-[100%]   bg-zinc-100 z-10  h-full  ">
      <div className="w-full h-full">
        <Button onClick={() => navigate("/")}>Back</Button>
        <Button onClick={() => changeUrl(() => "/Eloquent_JavaScript.pdf")}>
          set url
        </Button>
        <Button onClick={() => info(PDF.page.get(1))}>Page info</Button>
        <Button onClick={() => navigate("/pdfview/list")}>list page</Button>
      </div>
      <div className="w-full">
        <LinearProgress
          variant="indeterminate"
          sx={{
            display: isPageLoaded ? "none" : "block",
          }}
        />
      </div>
    </div>
  );
};

const BrowserList = ({ changeUrl }) => {
  const navigate = useNavigate();
  const _changeUrl = (url) => {
    if (url !== localStorage.getItem("url")) {
      localStorage.setItem("default_page_view", 1);
      localStorage.setItem("default_page_total", 6);
    }
    changeUrl(() => url);
    navigate("/pdfview");
  };
  const url1 = "/Eloquent_JavaScript.pdf";
  const url2 = "/Learning the bash Shell, 3rd Edition (3).pdf";
  const url3 = "https://mozilla.github.io/pdf.js/web/viewer.html";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col items-center"
    >
      <div></div>
      <div className="flex justify-center">
        <Button onClick={() => _changeUrl(url1)}>jsvascript book</Button>
        <Button onClick={() => _changeUrl(url2)}>bash book</Button>
        <Button onClick={() => _changeUrl(url3)}>test https</Button>
      </div>
    </motion.div>
  );
};

export default function PdfPage() {
  var DEFAULT_URL = localStorage.getItem("url");
  let DEFAULT_PAGE_VIEW = localStorage.getItem("default_page_view") || 1;
  let DEFAULT_PAGE_TOTAL = localStorage.getItem("default_page_total") || 6;

  if (!DEFAULT_URL) {
    DEFAULT_URL = "/Eloquent_JavaScript.pdf";
  }
  const [url, setUrl] = useState(DEFAULT_URL);
  const [isPdfReady, setPdfReady] = useState(false);
  const [triggerRerenderS2, setTriggerRerenderS2] = useState(false);
  const [triggerRerenderS3, setTriggerRerenderS3] = useState(false);
  const [triggerRerenderNextPage, setTriggerRerenderNextPage] = useState(false);
  const [triggerDefaultJumpPage, setTriggerDefaultJumpPage] = useState(false);
  const [pageIndex, setPageIndex] = useState(null);
  const [pageTotalCount, setPageTotalCount] = useState(DEFAULT_PAGE_TOTAL);
  const [pageScale, setPageScale] = useState(2);
  const [pageRotation, setPageRotation] = useState(0);
  const [disableObserver, setDisableObserver] = useState(false);
  const [canvasStoreRef, setCanvasStoreArrayRef] = useState([]);

  const mState = {
    canvasStoreRef,
    url,
    pageIndex,
    pageScale,
    pageRotation,
    pageTotalCount,
    isPdfReady,
    triggerRerenderS2,
    triggerRerenderS3,
    triggerRerenderNextPage,
    triggerDefaultJumpPage,
    setUrl,
    setPageIndex,
    setPageScale,
    setPageRotation,
    setPdfReady,
    setPageTotalCount,
    setCanvasStoreArrayRef,
    setTriggerRerenderS2,
    setTriggerRerenderS3,
    setTriggerRerenderNextPage,
    setDisableObserver,
    setTriggerDefaultJumpPage,
    DEFAULT_PAGE_VIEW,
    disableObserver,
  };

  return (
    <>
      <PdfStartEngine mState={mState} />
      <Routes>
        <Route path="list" element={<BrowserList />}></Route>
        <Route index element={<PdfViewEngine mState={mState} />}></Route>
        <Route
          path="*"
          element={<NoteFound docName="PDF pageview !!" />}
        ></Route>
      </Routes>
    </>
  );
}

function info(...args) {
  console.log(" => info : ", ...args);
}
function log(...args) {
  console.log("=> log : ", ...args);
}
function err(...args) {
  console.error("=> error : ", ...args);
}
function warn(...args) {
  console.warn("=> warn : ", ...args);
}
function table(obj) {
  console.table(obj);
}
