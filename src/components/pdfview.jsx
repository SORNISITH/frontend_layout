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
    return this.pdf._pdfInfo.numPages;
  }
}

//WARNING :
/// global this for fix render canvas error
//-------------------------------------------------------------------------------
const PDF = new PDF_JS_DIST();

function PdfView({ url }) {
  let DEFAULT_PAGE_VIEW = localStorage.getItem("default_page_view") || 1;
  let DEFAULT_PAGE_TOTAL = localStorage.getItem("default_page_total") || 3;
  //check step
  const [isPdfReady, setPdfReady] = useState(false);
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [isRenderReady, setRenderReady] = useState(false);

  // Page behav
  const [pageView, setPageView] = useState(DEFAULT_PAGE_VIEW);
  const [pageTotal, setPageTotal] = useState(DEFAULT_PAGE_TOTAL);
  const [pageScale, setPageScale] = useState(2);
  const [pageRotation, setPageRotation] = useState(0);

  const [canvasStoreArrayRef, setCanvasStoreArrayRef] = useState([]);
  const S3_renderNextPage = async () => {
    const page = canvasStoreArrayRef.length;
    if (!isPdfReady) return;
    if (!isCanvasReady) return;
    await renderPage(
      canvasStoreArrayRef[page - 1],
      page,
      pageScale,
      pageRotation,
    );
  };
  const S2_createNextCanvas = () => {
    if (!isPdfReady) return;
    setCanvasReady(false);
    setCanvasStoreArrayRef((prev) => [...prev, createRef()]);
    setCanvasReady(true);
  };
  const S3_renderAllPage = async () => {
    if (!isPdfReady) return;
    if (!isCanvasReady) return;
    setRenderReady(false);
    for (let i = 1; i <= canvasStoreArrayRef.length; i++) {
      await renderPage(canvasStoreArrayRef[i - 1], i, pageScale, pageRotation);
    }
    setRenderReady(true);
  };
  const S2_createAllCanvas = () => {
    if (!isPdfReady) return;
    setCanvasReady(false);
    setCanvasStoreArrayRef(() => {
      const newArr = [];
      for (let i = 1; i <= pageTotal; i++) {
        newArr.push(createRef());
      }
      return newArr;
    });
  };

  const S1_loadPdf = async (_url) => {
    if (!_url) return;

    setPdfReady(false);
    localStorage.setItem("url", url);
    await PDF?.loadPdf(_url);
    setPdfReady(true);
  };

  const renderPage = async (canvas, pageNumber, scale, rotation) => {
    if (!PDF.pdf) return;
    await PDF.loadPage(pageNumber);
    await PDF.renderPage(canvas, pageNumber, scale, rotation);
  };

  const trickgerScroll = (_target) => {
    const arr = canvasStoreArrayRef;
    let target = _target;
    if (target > arr.length) {
      target = arr.length;
    }
    if (!arr[target]?.current) return;
    if (!isRenderReady) return;

    if (target <= 0 || target > arr.length) return;
    const scrollNextPage = () => {
      arr[target]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };
    if (arr.length > 0) {
      setTimeout(() => {
        const lastCanvas = document.getElementById(`canvas-${arr.length}`);
        if (lastCanvas) {
          lastCanvas.style.position = "relative";
          lastCanvas.classList.add("opacity-100");
        }
        scrollNextPage(); //  Runs after canvas update
      }, 50);
    }
  };
  const lazyLoadPage = new IntersectionObserver(
    (entries) => {
      info(entries[0]);
    },
    {
      root: document.getElementById("obs_root"),
      rootMargin: "0px", // No margin around the root
      threshold: 0.2,
    },
  );

  useEffect(() => {
    S1_loadPdf(url);
  }, [url]);

  useEffect(() => {
    S2_createAllCanvas();
  }, [isPdfReady, pageTotal]);

  useEffect(() => {
    setCanvasReady(true);
    S3_renderAllPage();
  }, [pageScale, pageRotation, isCanvasReady]);

  useEffect(() => {
    S3_renderNextPage();
  }, [canvasStoreArrayRef]);

  useEffect(() => {
    trickgerScroll(pageView);
  }, [pageView, isRenderReady]);

  return (
    <div className="w-[100%] h-[100%]  flex flex-col items-center  overflow-hidden ">
      <ResponsiveLayout>
        <div className="w-full h-[7%] shadow-md ">
          <div className="flex justify-center items-center">
            <Button onClick={() => S2_createNextCanvas()}>add canvas 1</Button>
            <Button onClick={() => setPageTotal(10)}>render canvas</Button>
            <Button onClick={() => setPageRotation(90)}>rotation</Button>
            <Button onClick={() => setPageView(4)}>scroll</Button>
          </div>
          <div>
            <Dashboard isPageLoaded={isPdfReady} />
          </div>
          <hr className="opacity-5" />
        </div>
        <div
          id="obs_root"
          className=" gap-2  h-[93%] w-[100%] z-0 flex flex-col  no-scrollbar shadow-md items-center    scroll-smooth  overflow-auto "
        >
          {canvasStoreArrayRef?.map((ref, index) => (
            <canvas
              id={`canvas-${index + 1}`}
              key={index + 1}
              ref={ref}
              className={clsx(
                " opacity-100 w-[99%] shadow-md transition-all  duration-70 ease-in",
              )}
            ></canvas>
          ))}
        </div>
      </ResponsiveLayout>
    </div>
  );
}

const Dashboard = ({ isPageLoaded, setUrl }) => {
  const navigate = useNavigate();
  return (
    <div className="w-[100%]   bg-zinc-100 z-10  h-full  ">
      <div className="w-full h-full">
        <Button onClick={() => navigate("/")}>Back</Button>
        <Button onClick={() => info(PDF.pdf)}>PDF info</Button>
        <Button onClick={() => info(PDF.page.get(1))}>Page info</Button>
        <Button
          onClick={() =>
            setUrl("/Learning the bash Shell, 3rd Edition (3).pdf")
          }
        >
          Download
        </Button>
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

const ListPdf = ({ setUrl }) => {
  const navigate = useNavigate();
  const getPdf = (url) => {
    if (url !== localStorage.getItem("url")) {
      localStorage.setItem("default_page_view", 0);
      localStorage.setItem("default_page_total", 3);
    }
    setUrl(url);
    navigate("/pdfview");
  };
  const url1 = "/Eloquent_JavaScript.pdf";
  const url2 = "/Learning the bash Shell, 3rd Edition (3).pdf";

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div></div>
      <div className="flex justify-center">
        <Button onClick={() => getPdf(url1)}>jsvascript book</Button>
        <Button onClick={() => getPdf(url2)}>bash book</Button>
      </div>
    </div>
  );
};

export default function PdfPage() {
  var DEFAULT_URL = localStorage.getItem("url");
  if (!DEFAULT_URL) {
    DEFAULT_URL = "/Eloquent_JavaScript.pdf";
  }
  const [url, setUrl] = useState(DEFAULT_URL);
  return (
    <Routes>
      <Route path="*" element={<NoteFound docName="PDF pageview !!" />}></Route>
      <Route path="list" element={<ListPdf setUrl={setUrl} />}></Route>
      <Route index element={<PdfView url={url} />}></Route>
    </Routes>
  );
}
