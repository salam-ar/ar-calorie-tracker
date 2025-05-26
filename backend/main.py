from fastapi import FastAPI, UploadFile, File
import os, shutil, subprocess
from uuid import uuid4

app = FastAPI()

UPLOAD_DIR = "./uploads"
FRAME_DIR = "./frames"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAME_DIR, exist_ok=True)

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    job_id = str(uuid4())
    video_path = f"{UPLOAD_DIR}/{job_id}.mp4"

    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Use ffmpeg to extract 2 frames per second
    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-vf", "fps=2", f"{FRAME_DIR}/{job_id}_%03d.jpg"
    ])

    return {"status": "success", "job_id": job_id}
