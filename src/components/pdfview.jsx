// npm install pdfjs-dist --save-dev
//
//
//@mui
import { Button, LinearProgress } from "@mui/material";
//---------------------------------------------------------------------
import { Routes, Route, useNavigate } from "react-router";
import NoteFound from "@/pages/404";
import { ResponsiveLayout } from "@/layouts/default_layout";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useState, useRef, createRef } from "react";
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

class PDF_JS_DIST {
  constructor() {
    this.lip = pdfjsLib;
    this.pdf = null;
    this.page = new Map();
    this.render = null;

    // fix error render canvas
    this.pageRendering = false;
    this.pageNumPending = null;
  }

  clearPage() {
    this.page.clear();
  }
  async loadPdf(url) {
    if (!this.lip) return;
    try {
      this.pdf = await this.lip.getDocument(url).promise;
      this.LoadedPDF = true;
    } catch (error) {
      console.error("=> error obj load pdf : " + error);
    }
  }

  async loadPage(number) {
    const page = number || 1;
    if (!page) return;
    try {
      const resultLoadPage = await this.pdf.getPage(page);
      this.page.set(page, resultLoadPage);
      return resultLoadPage;
    } catch (error) {
      console.error("=> error obj load page : " + error);
    }
  }

  async renderPage(canvasRef, pageNumber, scale, rotation) {
    if (!canvasRef) return;
    var _page = pageNumber || 1;
    var _scale = scale || 1;
    var _rotation = rotation || 0;
    if (this.page.size === 0) return;

    if (this.pageRendering) {
      this.pageRendering = _page;
    } else {
      this.pageRendering = true;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = await this.page
        .get(_page)
        .getViewport({ scale: _scale, rotation: _rotation });
      const context = canvas.getContext("2d");

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = this.page.get(_page).render(renderContext);
      this.LoadedPage = true;
      renderTask.promise.then(() => {
        this.pageRendering = false;
        if (this.pageNumPending !== null) {
          // Waited page must be rendered
          this.renderPage(canvasRef, _page, _scale, _rotation);
          // Must be set to null to prevent infinite loop
          this.pageNumPending = null;
        }
      });
    }
  }

  get totalPage() {
    return this.pdf._pdfInfo.numPages;
  }
}

/// global this for fix render canvas error
//-------------------------------------------------------------------------------
const PDF = new PDF_JS_DIST();

function PdfView({ url }) {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [canvasEelements, setCanvasEelement] = useState([]);
  const canvas = useRef(new Map());

  async function loadPdf(url) {
    console.log("loading > " + url);
    canvas.current.clear();
    setPageLoaded(false);
    addCavas(1);
    await PDF.loadPdf(url);
    await pageRender(1);
  }

  async function pageRender(pageNumber, scale, rotation) {
    await PDF.loadPage(pageNumber);
    await PDF.renderPage(
      canvas.current.get(pageNumber),
      pageNumber,
      scale,
      rotation,
    );
    setPageLoaded(true);
  }

  // iritail load pdf from url
  useEffect(() => {
    loadPdf(url);
  }, [url]);
  //  addCanvas '
  function addCavas(pageNumber) {
    canvas.current.set(pageNumber || 1, createRef());
  }

  useEffect(() => {
    const canvasArr = [];
    for (const [key, ref] of canvas.current) {
      canvasArr.push(<canvas key={key} ref={ref} className="w-full shadow" />);
    }
    setCanvasEelement(canvasArr);
  }, []);

  return (
    <div className="w-[100%] h-[100%] flex flex-col items-center overflow-hidden ">
      <ResponsiveLayout>
        <Button>clear canvas</Button>
        <Dashboard isPageLoaded={pageLoaded} />
        <div className=" gap-2 h-[93%] w-[100%]  flex flex-col  items-center overflow-scroll ">
          {canvasEelements}
        </div>
      </ResponsiveLayout>
    </div>
  );
}

const Dashboard = ({ isPageLoaded, setUrl }) => {
  const navigate = useNavigate();
  return (
    <div className="w-[100%]   bg-zinc-100 z-10  h-15 shadow-md ">
      <div className="w-full h-full">
        <Button onClick={() => navigate("/")}>Back</Button>
        <Button onClick={() => console.log(PDF.pdf)}>PDF info</Button>
        <Button onClick={() => console.log(PDF.page.get(1))}>Page info</Button>
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
      <hr className="opacity-5" />
    </div>
  );
};
const List = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full">
      <Button>Change url</Button>
      <Button onClick={() => navigate("/pdfview")}>back</Button>
    </div>
  );
};

export default function PdfPage() {
  const [url, setUrl] = useState("/Eloquent_JavaScript.pdf");
  return (
    <>
      <Routes>
        <Route
          path="*"
          element={<NoteFound docName="PDF pageview !!" />}
        ></Route>
        <Route path="list" element={<List setUrl={setUrl} />}></Route>
        <Route index element={<PdfView url={url} />}></Route>
      </Routes>
    </>
  );
}
