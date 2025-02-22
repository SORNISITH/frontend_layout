import { useNavigate } from "react-router";
import { Button } from "@mui/material";
export default function MainPage() {
  const navigate = useNavigate();
  return (
    <div className="w-full  h-full flex flex-col justify-center items-center">
      <div className="w-full h-full gap-3 flex   ">
        <div>
          <Button onClick={() => navigate("/pdfview")} variant="contained">
            PDF viewer
          </Button>
          <Button onClick={() => navigate("/login")} variant="contained">
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
