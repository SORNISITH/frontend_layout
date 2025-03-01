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
// npm install pdfjs-dist --save-dev
//@mui
import { Button, LinearProgress } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
//---------------------------------------------------------------------
import { Routes, Route, useNavigate } from "react-router";
import NoteFound from "@/pages/404";
import { ResponsiveLayout } from "@/layouts/default_layout";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, createRef } from "react";
import clsx from "clsx";
///cdn worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";
// my class
class PDF_JS_DIST {
  constructor() {
    this.lip = pdfjsLib;
    this.pdf = null;
    this.page = new Map();

    // fix error render canvas
    this.pageRendering = false;
  }

  clearPage() {
    this.page.clear();
  }

  async loadPdf(url) {
    if (!this.lip) return;
    info("fetching ... pdf : " + url);
    try {
      this.pdf = await this.lip.getDocument(url).promise;
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
  //check
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(0);
  const [pageScale, setPageScale] = useState(2);
  const [pageRotation, setPagerotation] = useState(0);
  // ------------>
  const [canvasArray, setCanvasArray] = useState([]);

  //watcher
  async function S1_loadPdf(url) {
    if (isUrlLoaded === true) return;
    setPageLoaded(false);
    info("loading url from > " + url);
    await PDF.loadPdf(url);
    // addCanvas(pageNumber);
    // render default -------page
    // await renderPage(1, pageScale, pageRotation);
    //
    return Promise.resolve();
  }
  const S2_loadCanvasArray = async () => {
    if (isUrlLoaded === false) return;
    if (isCanvasLoaded === true) return;
    setCanvasArray((prevState) => [...prevState, createRef()]);
    setIsCanvasLoaded(true);
  };

  const S2_addCanvasArray = () => {
    setCanvasArray((prevState) => [...prevState, createRef()]);
  };
  const S3_reRenderAllPage = async (arr) => {
    if (isUrlLoaded === false) return;
    if (isCanvasLoaded === false) return;
    // for (let i = 0; i < arr.length; i++) {
    //   await renderPage(i, pageScale, pageRotation);
    // }
    await Promise.all(
      arr.map((_, i) => renderPage(i + 1, pageScale, pageRotation)),
    );
    return Promise.resolve();
  };

  const S3_renderNextPage = async () => {
    await renderPage(canvasArray.length, pageScale, pageRotation);
    // if (canvasArray.length > 0) {
    //   setTimeout(() => {
    //     const lastCanvas = document.getElementById(
    //       `canvas-${canvasArray.length}`,
    //     );
    //     if (lastCanvas) {
    //       lastCanvas.style.position = "relative"; // Ensure it's in the DOM
    //       lastCanvas.classList.add("opacity-100");
    //     }
    //   }, 50); // Short delay to ensure iOS renders first
    // }
    //
    //
    if (canvasArray.length > 0) {
      setTimeout(() => {
        const lastCanvas = document.getElementById(
          `canvas-${canvasArray.length}`,
        );
        if (lastCanvas) {
          lastCanvas.style.position = "relative";
          lastCanvas.classList.add("opacity-100");
        }
        scrollNextPage(); // ✅ Runs after canvas update
      }, 50);
    }
  };

  async function renderPage(pageNumber, scale, rotation) {
    if (!PDF.pdf) return;
    await PDF.loadPage(pageNumber);
    await PDF.renderPage(canvasArray[0], pageNumber, scale, rotation);
  }
  const scrollNextPage = () => {
    canvasArray[canvasArray.length - 1].current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  async function initLoadUrl() {
    const ready = S1_loadPdf(url);
    ready.then(() => {
      setIsUrlLoaded(true);
    });
  }
  async function initLoadCanvas() {
    S2_loadCanvasArray();
  }
  async function initLoadAllPage() {
    const ready = S3_reRenderAllPage(canvasArray);
    ready.then(() => {
      setPageLoaded(true);
    });
  }
  useEffect(() => {
    //  init load pdf from url
    initLoadUrl();
  }, [url]);

  useEffect(() => {
    initLoadCanvas();
  }, [isUrlLoaded]);

  useEffect(() => {
    //first load
    initLoadAllPage();
  }, [isCanvasLoaded]);

  // useEffect(() => {
  //   S3_renderNextPage();
  // }, [page]);

  useEffect(() => {
    initLoadAllPage();
  }, [pageScale, pageRotation]);

  useEffect(() => {
    S3_renderNextPage();
  }, [canvasArray]);

  return (
    <div className="w-[100%] h-[100%]  flex flex-col items-center  overflow-hidden ">
      <ResponsiveLayout>
        <div className="w-full h-[7%] shadow-md ">
          <div className="flex justify-center items-center">
            <Button onClick={() => S2_addCanvasArray()}>add canvas 1</Button>
            <Button onClick={() => setPagerotation(90)}>roation</Button>
            <Button onClick={() => scrollNextPage()}>scroll</Button>
            <Button onClick={() => setPage(1)}>test</Button>
          </div>
          <div>
            <Dashboard isPageLoaded={pageLoaded} />
          </div>
          <hr className="opacity-5" />
        </div>
        <div className=" gap-2  h-[93%] w-[100%] z-0 flex flex-col  no-scrollbar shadow-md items-center    scroll-smooth  overflow-auto ">
          {canvasArray?.map((ref, index) => (
            <canvas
              id={`canvas-${index + 1}`}
              key={index + 1}
              ref={ref}
              className={clsx(
                " opacity-100 w-[99%] shadow-md transition-all  duration-500 ease-out",
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
  const [url, setUrl] = useState("/Eloquent_JavaScript.pdf");
  const [page, setPage] = useState(1);
  return (
    <Routes>
      <Route path="*" element={<NoteFound docName="PDF pageview !!" />}></Route>
      <Route path="list" element={<ListPdf setUrl={setUrl} />}></Route>
      <Route index element={<PdfView url={url} />}></Route>
    </Routes>
  );
}
