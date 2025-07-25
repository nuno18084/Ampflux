@app.get("/")
def read_root():
    return {"message": "AmpFlux Backend API is running"} 