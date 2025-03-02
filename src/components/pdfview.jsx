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
    <div className="2xl:w-[50%] xl:w-[60%] lg:w-[70%] md:w-[80%] h-full w-[100%] bg-zinc-100  ">
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
import { useEffect, useState, useRef, createRef } from "react";
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
  let defaultTotalPage = localStorage?.getItem("totalPage") || 3;
  let defaultPageView = localStorage?.getItem("viewPage") || 0;
  const [isPdfLoad, setPdfLoad] = useState(false);
  const [isCanvasLoad, setCanvasLoad] = useState(false);
  const [isPageRender, setPageRender] = useState(false);
  //customize canvas behavior
  const [pageScale, setPageScale] = useState(2);
  const [pageRotation, setPagerotation] = useState(0);
  const [pageIndex, setPageIndex] = useState(defaultTotalPage);
  // ------------>
  const [canvasArray, setCanvasArray] = useState([]);
  const [canvasNextPage, setCanvasNextPage] = useState([]);
  const [obsFree, setObsFree] = useState(false);
  //watcher
  const S1_loadPdf = async (_url) => {
    await PDF?.loadPdf(_url);
    localStorage.setItem("url", url);
    setPdfLoad(true);
    // addCanvas(pageNumber);
    // render default -------page
  };

  const S2_loadCanvasArray = () => {
    if (!isPdfLoad) return;
    for (let i = 1; i <= Number(pageIndex); i++) {
      setCanvasArray((prevState) => [...prevState, createRef()]);
    }
    setCanvasLoad(true);
  };

  const S2_addCanvasArray = () => {
    if (!isPdfLoad) return;
    const newArr = [...canvasArray];
    // setCanvasArray((prevState) => [...prevState, createRef()]);
    newArr?.push(createRef());
    setCanvasNextPage(newArr);
    setCanvasArray(newArr);
    localStorage.setItem("totalPage", newArr.length);
  };
  const S3_RenderAllPage = async () => {
    setObsFree(false);
    for (let i = 1; i <= canvasArray.length; i++) {
      await renderPage(i, pageScale, pageRotation);
    }
    trickgerScroll(defaultPageView);
    setPageRender(true);
  };

  const S3_renderNextPage = async () => {
    setObsFree(true);
    if (isCanvasLoad === false) return;
    await renderPage(canvasArray.length, pageScale, pageRotation);
  };

  const trickgerScroll = (target, block) => {
    if (target <= 0) return;
    const scrollNextPage = () => {
      canvasArray[target].current.scrollIntoView({
        behavior: "smooth",
        block: block ? "center" : "start",
      });
    };
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

  const renderPage = async (pageNumber, scale, rotation) => {
    if (!PDF.pdf) return;
    await PDF.loadPage(pageNumber);
    await PDF.renderPage(
      canvasArray[pageNumber - 1],
      pageNumber,
      scale,
      rotation,
    );
  };
  const opt = {
    root: document.getElementById("obs_root"),
    rootMargin: "0px",
    threshold: 0.3,
  };
  const opt_level1 = {
    root: document.getElementById("obs_root"),
    rootMargin: "0px",
    threshold: 0.1,
  };

  const obs_load = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting == true) {
      S2_addCanvasArray();
    }
  }, opt);

  const obs_opacity = new IntersectionObserver((entries) => {
    entries.forEach((ele) => {
      if (ele.isIntersecting) {
        if (obsFree === true) {
          const index = ele.target.dataset.index;
          localStorage.setItem("viewPage", index);
        }
        ele.target.style.opacity = "1";
      } else {
        ele.target.style.opacity = "0";
      }
    });
  }, opt_level1);

  const lazyOpacity = () => {
    if (canvasArray <= 0) return;
    canvasArray.forEach((element, index) => {
      if (element.current) {
        element.current.dataset.index = index;
        obs_opacity.observe(element?.current);
      }
    });
  };
  const lazyLoadPage = () => {
    if (isCanvasLoad === false) return;
    if (canvasArray.length <= 0) return;
    obs_load.observe(canvasArray[canvasArray.length - 2].current);
    // canvasArray.forEach((element) => obs.observe(element?.current));
  };

  useEffect(() => {
    S1_loadPdf(url);
  }, [url]);

  useEffect(() => {
    S2_loadCanvasArray();
  }, [isPdfLoad]);

  useEffect(() => {
    S3_RenderAllPage();
  }, [isCanvasLoad]);

  useEffect(() => {
    // S3_renderNextPage();
    S3_renderNextPage();
  }, [canvasNextPage.length]);

  useEffect(() => {
    S3_RenderAllPage();
  }, [pageRotation, pageScale]);

  useEffect(() => {
    lazyLoadPage();
    lazyOpacity();
  }, [canvasArray.length]);
  return (
    <div className="w-[100%] h-[100%]  flex flex-col items-center  overflow-hidden ">
      <ResponsiveLayout>
        <div className="w-full h-[7%] shadow-md ">
          <div className="flex justify-center items-center">
            <Button onClick={() => S2_addCanvasArray()}>add canvas 1</Button>
            <Button onClick={() => setPagerotation(90)}>roation</Button>
            <Button onClick={() => setPageIndex((prev) => prev + 100)}>
              render all page
            </Button>
          </div>
          <div>
            <Dashboard isPageLoaded={isPdfLoad} />
          </div>
          <hr className="opacity-5" />
        </div>
        <div
          id="obs_root"
          className=" gap-2  h-[93%] w-[100%] z-0 flex flex-col  no-scrollbar shadow-md items-center    scroll-smooth  overflow-auto "
        >
          {canvasArray?.map((ref, index) => (
            <canvas
              id={`canvas-${index + 1}`}
              key={index + 1}
              ref={ref}
              className={clsx(
                " opacity-0 w-[99%] shadow-md transition-all  duration-70 ease-in",
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
      localStorage.setItem("viewPage", 0);
      localStorage.setItem("totalPage", 3);
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
  const [url, setUrl] = useState(localStorage.getItem("url"));
  const [page, setPage] = useState(1);
  return (
    <Routes>
      <Route path="*" element={<NoteFound docName="PDF pageview !!" />}></Route>
      <Route path="list" element={<ListPdf setUrl={setUrl} />}></Route>
      <Route index element={<PdfView url={url} />}></Route>
    </Routes>
  );
}
