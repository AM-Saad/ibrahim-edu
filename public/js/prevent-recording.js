function handleVisibilityChange() {
    if (document.hidden) {
        console.log("Hidden");
    } else  {
        console.log("Visible");
    }
  }
  
  document.addEventListener("visibilitychange", handleVisibilityChange, false);