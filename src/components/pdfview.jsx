// npm install pdfjs-dist --save-dev
//@mui   clsx  react react-router  motion
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import { Button, LinearProgress } from "@mui/material";
import ViewWeekRoundedIcon from "@mui/icons-material/ViewWeekRounded";
import { motion } from "motion/react";
import { useVirtualizer } from "@tanstack/react-virtual";
//---------------------------------------------------------------------
import { Routes, Route, useNavigate } from "react-router";
import NoteFound from "@/pages/404";
import * as pdfjsLib from "pdfjs-dist";
import {
  useEffect,
  useState,
  useRef,
  createRef,
  useCallback,
  useMemo,
} from "react";
import clsx from "clsx";
///cdn worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

//WARNING :
/// global this for fix render canvas error
//-------------------------------------------------------------------------------

function PdfViewEngine({ state }) {
  //layout
  const [toggleSideBar, setToggleSideBar] = useState(() => {
    const storedValue = JSON.parse(getLS("side_bar"));
    return storedValue === true; // Convert string to boolean
  });
  // @pdf behavior
  const [pageTotal, setPageTotal] = useState(null);
  const [pageIndex, setPageIndex] = useState(null);
  const [pageRotation, setPageRotation] = useState(0);
  const [pageScale, setPageScale] = useState(2);
  const [pageMax, setMaxPage] = useState(null);
  const [pageCurrentView, setPageCurrentView] = useState(() =>
    state?.DEFAULT_PAGEVIEW(),
  );
  const [pdf, setPdf] = useState(null);
  const [isPdfReady, setPdfReady] = useState(null);
  const [canvasRef, setCanvasRef] = useState([]);
  const [triggerGlobalRender, setTriggerGlobalRender] = useState(false);
  const renderTask = new Map();
  const renderPage = async (
    _canvas,
    _pageNumber,
    _pageScale,
    _pageRotation,
  ) => {
    if (!pdf) return;
    if (!_canvas) return;
    const canvas = _canvas.current;
    const page = _pageNumber ?? 1;
    const scale = _pageScale ?? 1;
    const rotation = _pageRotation ?? 0;
    const pdfPage = await pdf.getPage(page);
    const viewport = pdfPage?.getViewport({ scale: scale, rotation: rotation });
    const context = canvas?.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = viewport.height || 1;
    canvas.width = viewport.width || 1;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    // Cancel any previous render task for the same page
    if (renderTask.has(page)) {
      const task = renderTask.get(page);
      task.cancel(); // Cancel the previous render task
    }

    // Start the render task
    const renderTaskObj = pdfPage.render(renderContext);

    // Store the renderTask object for cancellation later
    renderTask.set(page, renderTaskObj);

    try {
      // Wait for the render task to finish
      await renderTaskObj.promise;
    } catch (error) {
      if (error.name === "RenderingCancelledException") {
        console.info(`Rendering for page ${page} was cancelled`);
      } else {
        console.error("Error rendering page:", error);
      }
    }
    drawPage(context, canvas, page);
    info("Finish render page : " + page);
  };

  const loadPdf = async (_url) => {
    try {
      if (!_url) return;
      setPdfReady(() => false);
      if (_url === localStorage.getItem("pdf_url") && pdf) {
        setPdfReady(() => true);
        return info("Loaded Same URL : ", _url);
      }
      const _data = pdfjsLib?.getDocument(_url);
      const _pdf = await _data?.promise;
      if (!_pdf) return;
      setPdf(() => _pdf);
      setPdfReady(() => true);
      info(`fetch done! .....${_url} `);
      info(_pdf);
      localStorage.setItem("pdf_url", _url);
    } catch (error) {
      err(" loadpdf : ", _url, error);
    }
  };

  const createNextCanvas = () => {
    if (!pdf) return;
    if (!isPdfReady) return;
    setCanvasRef((prev) => [...prev, createRef()]);
  };

  const createAllCanvas = (_number) => {
    if (!pdf) return;
    if (!isPdfReady) return;
    setMaxPage(() => pdf._pdfInfo.numPages);
    setCanvasRef((prev) => {
      const newCanvasRefs = [...prev]; // Copy the previous state
      for (let i = 1; i <= _number; i++) {
        newCanvasRefs.push(createRef()); // Add new refs to the array
      }
      return newCanvasRefs; // Return the updated array
    });
    info("created all default canvas");
    setTriggerGlobalRender((prev) => !prev);
  };
  const renderCurrentCanvas = async (page) => {
    if (!pdf) return;
    await renderPage(canvasRef[page - 1], page, pageScale, pageRotation);
  };
  const jumpNextPage = () => {
    const pi = Number(pageCurrentView);
    setPageIndex(() => pi + 1);
  };
  const jumpPrevPage = () => {
    const pi = Number(pageCurrentView);
    setPageIndex(() => pi - 1);
  };

  const jumpToPage = (target) => {
    const _target = Number(target) || 1;
    if (!_target) return info("@param 1 target not defined");
    if (_target <= 0 || _target >= pageMax || !_target) return;
    if (_target)
      if (pageTotal <= _target) {
        info("page view bigger");
      } else {
        canvasRef[_target - 1]?.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
  };
  const lazyViewPage = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const eleIndex = entry.target.dataset.index;
          if (eleIndex == pageMax) return;
          const halfLen = canvasRef.length / 2;
          const pageNumber = Number(eleIndex) + 1;
          if (!canvasRef[pageNumber]) return;
          if (!renderTask.has(pageNumber)) {
            renderCurrentCanvas(pageNumber);
          }
          setPageCurrentView(() => pageNumber);
          setLS("page_current_view", pageNumber);
        }
      });
    },
    {
      root: document.getElementById("obs_root"),
      rootMargin: "100px", // No margin around the root
      threshold: 0.4,
    },
  );
  const lazyNextPage = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          createNextCanvas();
          lazyNextPage?.unobserve(entry.target);
          setLS("total_page", canvasRef.length);
        }
      });
    },
    {
      root: document.getElementById("obs_root"),
      rootMargin: "100px", // No margin around the root
      threshold: 0.3,
    },
  );

  const watchLazy = (_arrRef) => {
    if (!_arrRef) return;
    if (_arrRef?.length <= 5) return;
    const watchPage = _arrRef[_arrRef.length - 2].current;
    const watchPage3 = _arrRef[_arrRef.length - 3].current;
    const watchPage2 = _arrRef[_arrRef.length - 1].current;
    lazyNextPage?.observe(watchPage);
    lazyNextPage?.observe(watchPage2);
    lazyNextPage?.observe(watchPage3);
    canvasRef?.map((ref, index) => {
      lazyViewPage?.observe(ref.current);
    });
  };

  useEffect(() => {
    watchLazy(canvasRef);
    setPageTotal(() => canvasRef.length);
  }, [canvasRef]);
  useEffect(() => {
    loadPdf(state.url);
  }, [state.url]); // load when url change

  useEffect(() => {
    createAllCanvas(state.DEFAULT_TOTALPAGE());
  }, [isPdfReady]); // Run effect only

  useEffect(() => {
    localStorage.setItem("side_bar", JSON.stringify(toggleSideBar));
  }, [toggleSideBar]);

  useEffect(() => {
    jumpToPage(pageIndex);
  }, [pageIndex]);
  useEffect(() => {}, [pageCurrentView]);

  const pdfViewEngineState = {
    setPageTotal,
    isPdfReady,
  };
  return (
    <motion.div
      key="pdfview/main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[100%] h-[100%] min-h-screen  overflow-hidden flex justify-center"
    >
      <div className="w-full h-full 2xl:w-[50%] xl:w-[65%] lg:w-[80%] md:w-[100%]   bg-zinc-100  flex flex-col gap-[2px] items-center justify-center ">
        <div className=" w-full h-[6%] shadow-md ">
          <Dashboard state={pdfViewEngineState} />
        </div>
        <div className="w-[100%]  flex h-[94%]  relative  gap-[1px]">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: toggleSideBar ? "25%" : "0%" }}
            transition={{
              duration: 0.2,
            }}
          >
            <SidePdfViewEngine />
          </motion.div>
          <div className=" h-full w-full flex relative">
            <div className="w-[100%]  bg-zinc-400/10 absolute top-0 z-50 h-[40px] flex items-center justify-start ">
              <ViewWeekRoundedIcon
                onClick={() => setToggleSideBar((prev) => !prev)}
                color="action"
                fontSize="medium"
                className=" ml-2 cursor-pointer"
              />
              <div className="w-full gap-3 flex justify-center items-center ">
                <motion.span className="h-full rotate-180 cursor-pointer flex items-center justify-center">
                  <KeyboardDoubleArrowRightRoundedIcon
                    fontSize="large"
                    onClick={jumpPrevPage}
                    color="action"
                  />
                </motion.span>
                <motion.span className=" cursor-pointer flex items-center justify-center">
                  {pageCurrentView}
                </motion.span>
                <span className=" cursor-pointer flex items-center justify-center">
                  <p>/</p>
                </span>
                <span className=" cursor-pointer flex items-center justify-center">
                  {pageMax}
                </span>
                <span className=" cursor-pointer flex items-center justify-center">
                  <KeyboardDoubleArrowRightRoundedIcon
                    fontSize="large"
                    onClick={jumpNextPage}
                    color="action"
                  />
                </span>
              </div>
            </div>
            <div
              id="obs_root"
              className="gap-[2px]   h-[100%] w-[100%]  flex flex-col  no-scrollbar shadow-sm items-center    scroll-smooth  overflow-auto "
            >
              {canvasRef?.map((ref, index) => (
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
                  data-index={index}
                  id={`canvas-${index}`}
                  key={index}
                  ref={ref}
                  className={clsx(" w-[100%]    shadow-md ")}
                ></motion.canvas>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Dashboard = ({ state }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full flex flex-col justify-center  ">
      <div className="w-full ">
        <Button onClick={() => navigate("/")}>Back</Button>
        <Button onClick={() => state.setPageTotal(() => 20)}>
          set 20 canvas
        </Button>
        <Button onClick={() => navigate("/pdfview/")}>list page</Button>
      </div>
      <div className="w-full ">
        <LinearProgress
          variant="indeterminate"
          sx={{
            display: state.isPdfReady ? "none" : "block",
          }}
        />
      </div>
    </div>
  );
};

const BrowserList = ({ state }) => {
  const navigate = useNavigate();
  const changeUrl = (url) => {
    state.setUrl(url);
    navigate("/pdfview/engine");
  };
  const url1 = "/Eloquent_JavaScript.pdf";
  const url2 = "/Learning the bash Shell, 3rd Edition (3).pdf";
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
        <Button onClick={() => changeUrl(url1)}>jsvascript book</Button>
        <Button onClick={() => changeUrl(url2)}>bash book</Button>
      </div>
    </motion.div>
  );
};

const SidePdfViewEngine = () => {
  useEffect(() => {});
  return (
    <div className="w-full h-full  flex flex-col items-center ">
      <div></div>
      <div></div>
    </div>
  );
};

export default function PdfPage() {
  const DEFAULT_PAGEVIEW = () => getLS("page_current_view") ?? 1;
  const DEFAULT_TOTALPAGE = () => {
    const n = getLS("total_page") ?? 6;
    if (n == 0) return 6;
    if (!n) return 6;
    if (n <= 5) return 6;
    return n;
  };
  const DEFAULT_URL = () => getLS("pdf_url") ?? "/Eloquent_JavaScript.pdf";

  const [url, setUrl] = useState(() => DEFAULT_URL());

  const pdfPageState = {
    DEFAULT_PAGEVIEW,
    DEFAULT_TOTALPAGE,
    DEFAULT_URL,
    url,
    setUrl,
  };
  return (
    <Routes>
      <Route index element={<BrowserList state={pdfPageState} />}></Route>
      <Route
        path="engine"
        element={<PdfViewEngine state={pdfPageState} />}
      ></Route>
      <Route path="*" element={<NoteFound docName="PDF pageview !!" />}></Route>
    </Routes>
  );
}
const setLS = (_s, value) => localStorage.setItem(_s, value);
const getLS = (_s) => localStorage.getItem(_s);
function drawPage(context, _canvas, _page) {
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
