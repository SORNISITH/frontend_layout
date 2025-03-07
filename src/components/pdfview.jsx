function info(...args) {
  console.log("=> info : ", ...args);
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
const ResponsiveLayout = ({ children }) => {
  return (
    <div className="2xl:w-[50%] xl:w-[65%] lg:w-[80%] md:w-[99%] h-full w-[100%] bg-zinc-100  ">
      {children}
    </div>
  );
};

// npm install pdfjs-dist --save-dev
//@mui   clsx  react react-router
import { Button, LinearProgress } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
//---------------------------------------------------------------------
import { Routes, Route, useNavigate } from "react-router";
import NoteFound from "@/pages/404";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, createRef, useCallback } from "react";
import clsx from "clsx";
///cdn worker
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
  cleanPage() {
    if (!this.page) return;
    this.page.clear();
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
      info("Loading page ...");
      const resultLoadPage = await this.pdf.getPage(page);
      this.page.set(page, resultLoadPage);
    } catch (error) {
      err("=> error obj load page : " + error);
    }
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
        this.pageRendering = false;
      }
    } catch (error) {
      err(error);
    }
  }

  get totalPage() {
    return this.pdf?._pdfInfo?.numPages;
  }
}

//WARNING :
/// global this for fix render canvas error
//-------------------------------------------------------------------------------
const PDF = new PDF_JS_DIST();

function PdfView({ url, changeUrl }) {
  let DEFAULT_PAGE_VIEW = localStorage.getItem("default_page_view") || 1;
  let DEFAULT_PAGE_TOTAL = localStorage.getItem("default_page_total") || 6;
  //  trigger
  const [isPdfReady, setPdfReady] = useState(false);
  const [triggerRerenderS2, setTriggerRerenderS2] = useState(false);
  const [triggerRerenderS3, setTriggerRerenderS3] = useState(false);
  const [triggerRerenderNextPage, setTriggerRerenderNextPage] = useState(false);
  const [triggerDefaultJumpPage, setTriggerDefaultJumpPage] = useState(false);
  // Page behav
  const [pageIndex, setPageIndex] = useState(null);
  const [pageTotalCount, setPageTotalCount] = useState(DEFAULT_PAGE_TOTAL);
  const [pageScale, setPageScale] = useState(2);
  const [pageRotation, setPageRotation] = useState(0);
  const [disableObserver, setDisableObserver] = useState(false);
  const [canvasStoreArrayRef, setCanvasStoreArrayRef] = useState([]);

  const S3_renderNextPage = async (_arr) => {
    if (!isPdfReady) return info("S3_renderNextPage pending Processing pdf");
    if (!PDF?.pdf)
      return info("S3_renderNextPage checking is pdf already loaded ?");
    if (!_arr) return info("S3_renderNextgpage fn required array");
    const page = _arr?.length;
    await renderPage(_arr[page - 1], page, pageScale, pageRotation);
  };

  const S3_renderAllPage = async (_arrayRef) => {
    if (!isPdfReady) return info("S3_renderAllPage pending Processing pdf");
    if (!PDF?.pdf)
      return info("S3_renderAllPage checking is pdf already loaded ?");
    for (let i = 1; i <= _arrayRef?.length; i++) {
      await renderPage(_arrayRef[i - 1], i, pageScale, pageRotation);
    }
    setDisableObserver(() => true);
    setTriggerDefaultJumpPage(() => !triggerDefaultJumpPage);
  };

  const S2_createAllCanvas = async (param_totalPage) => {
    if (!isPdfReady) return info("S2_createAllCanvas pending  processing pdf");
    if (!PDF?.pdf) return info("S2_createAllCanvas pdf is not yet loaded");
    let _totalPage = Number(param_totalPage) < 6 ? 6 : param_totalPage;
    if (!_totalPage) return;
    setCanvasStoreArrayRef(() => {
      const newArr = [];
      for (let i = 1; i <= _totalPage; i++) {
        newArr.push(createRef());
      }
      return newArr;
    });
    info("error here");
    setTriggerRerenderS3(() => !triggerRerenderS3);
  };

  const S2_createNextCanvas = () => {
    setCanvasStoreArrayRef((prev) => [...prev, createRef()]);
    setTriggerRerenderNextPage(() => !triggerRerenderNextPage);
  };

  const S1_loadPdf = async (_url) => {
    if (!_url) return;
    setPdfReady(() => false);
    localStorage.setItem("url", _url);
    await PDF?.loadPdf(_url);
    setPdfReady(() => true);
    setTriggerRerenderS2(() => !triggerRerenderS2);
  };

  const renderPage = async (canvas, pageNumber, scale, rotation) => {
    if (!PDF?.pdf) return;
    await PDF?.loadPage(pageNumber);
    await PDF?.renderPage(canvas, pageNumber, scale, rotation);
  };

  //   const pindex = pageIndex + 2;
  // S2_createAllCanvas(pindex);
  // localStorage.setItem("default_page_view", target);
  // setIndexBigger(() => !isIndexBigger);

  const jumpToPage = (target) => {
    const _target = Number(target) || 1;
    if (!_target) return info("@param 1 target not defined");
    if (pageTotalCount < pageIndex) {
      info("page view bigger");
    } else {
      canvasStoreArrayRef[_target]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const lazyLoadOpacityOBS = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!disableObserver) {
            localStorage.setItem(
              "default_page_view",
              entry.target.dataset.index,
            );
          }
          entry.target.style.opacity = 1;
        } else {
          entry.target.style.opacity = 0;
        }
      });
    },
    {
      root: document.getElementById("obs_root"),
      rootMargin: "0px", // No margin around the root
      threshold: 0.01,
    },
  );
  const lazyLoadOpacity = () => {
    canvasStoreArrayRef.forEach((ref) => {
      lazyLoadOpacityOBS.observe(ref.current);
    });
  };
  const lazyLoadNextPageOBS = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          S2_createNextCanvas();
          lazyLoadOpacityOBS.unobserve(entry.target);
          // Observe the next page (e.g., page 9 after page 8)
          const nextPageIndex = canvasStoreArrayRef.length - 1;
          if (
            canvasStoreArrayRef[nextPageIndex] &&
            canvasStoreArrayRef[nextPageIndex + 1]
          ) {
            lazyLoadNextPageOBS.observe(
              canvasStoreArrayRef[nextPageIndex + 1].current,
            );
          }
        }
      });
    },
    {
      root: document.getElementById("obs_root"),
      rootMargin: "100px", // No margin around the root
      threshold: 0.3,
    },
  );

  const lazyLoadNextPage = () => {
    if (!canvasStoreArrayRef) return;
    if (canvasStoreArrayRef?.length <= 5) return;
    const watchPage =
      canvasStoreArrayRef[canvasStoreArrayRef.length - 2].current;
    const unWatchPage =
      canvasStoreArrayRef[canvasStoreArrayRef.length - 3].current;

    lazyLoadNextPageOBS?.observe(watchPage);
    lazyLoadNextPageOBS?.unobserve(unWatchPage); //unwatch full load
    // canvasArray.forEach((element) => obs.observe(element?.current));
  };

  useEffect(() => {
    S1_loadPdf(url);
  }, [url]);

  useEffect(() => {
    S2_createAllCanvas(5);
  }, [triggerRerenderS2, pageTotalCount]);

  useEffect(() => {
    S3_renderAllPage(canvasStoreArrayRef);
  }, [triggerRerenderS3, pageScale, pageRotation]);

  useEffect(() => {
    S3_renderNextPage(canvasStoreArrayRef);
  }, [triggerRerenderNextPage]);

  useEffect(() => {
    jumpToPage(DEFAULT_PAGE_VIEW);
  }, [triggerDefaultJumpPage]);

  useEffect(() => {
    jumpToPage(pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    localStorage.setItem("default_page_total", canvasStoreArrayRef.length);
    lazyLoadNextPage();
    lazyLoadOpacity();
  }, [canvasStoreArrayRef]);

  return (
    <div className="w-[100%] h-[100%]  flex flex-col items-center  overflow-hidden ">
      <ResponsiveLayout>
        <div className="w-full h-[7%] outline-1 shadow-md ">
          <Dashboard isPageLoaded={isPdfReady} changeUrl={changeUrl} />
          <div className="flex justify-center items-center">
            <Button onClick={() => S2_createNextCanvas()}>add canvas 1</Button>
            <Button onClick={() => setPageTotalCount(() => 100)}>
              render canvas
            </Button>
            <Button onClick={() => setPageRotation(90)}>rotation</Button>
            <Button onClick={() => setPageIndex(() => 100)}>page index</Button>
            <Button onClick={() => S2_createNextCanvas()}>next page</Button>
          </div>
          <hr className="opacity-5" />
        </div>
        <div
          id="obs_root"
          className=" gap-1   h-[93%] w-[100%]  flex flex-col  no-scrollbar shadow-sm items-center    scroll-smooth  overflow-auto "
        >
          {canvasStoreArrayRef?.map((ref, index) => (
            <canvas
              data-index={index + 1}
              id={`canvas-${index + 1}`}
              key={index + 1}
              ref={ref}
              className={clsx(
                "opacity-0 w-[100%]  shadow-md transition-all  duration-70 ease-in",
              )}
            ></canvas>
          ))}
        </div>
      </ResponsiveLayout>
    </div>
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
    <div className="w-full h-full flex flex-col items-center">
      <div></div>
      <div className="flex justify-center">
        <Button onClick={() => _changeUrl(url1)}>jsvascript book</Button>
        <Button onClick={() => _changeUrl(url2)}>bash book</Button>
        <Button onClick={() => _changeUrl(url3)}>test https</Button>
      </div>
    </div>
  );
};

export default function PdfPage() {
  var DEFAULT_URL = localStorage.getItem("url");
  if (!DEFAULT_URL) {
    DEFAULT_URL = "/Eloquent_JavaScript.pdf";
  }
  const [url, setUrl] = useState("/Eloquent_JavaScript.pdf");

  return (
    <Routes>
      <Route path="*" element={<NoteFound docName="PDF pageview !!" />}></Route>
      <Route path="list" element={<BrowserList changeUrl={setUrl} />}></Route>
      <Route index element={<PdfView url={url} changeUrl={setUrl} />}></Route>
    </Routes>
  );
}
