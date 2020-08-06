const customAudioElement = (audioSrc) => {
  return new Promise((resolve) => {
    // creating new elements
    const audioContainer = document.createElement('div');
    const audioElement = document.createElement('audio');
    const audioControlBtn = document.createElement('i');
    const durationContainer = document.createElement('div');
    const completedTime = document.createElement('span');
    const seperator = document.createElement('span');
    const totalTime = document.createElement('span');
    const progressBarContainer = document.createElement('div');
    const progressBar = document.createElement('div');

    // Assigning classnames
    audioContainer.className = 'audio-container';
    audioControlBtn.className = 'fas fa-play audio-control-btn';

    durationContainer.className = 'duration-container';

    progressBarContainer.className = 'progress-bar-container';
    progressBar.className = 'audio-progress-bar';

    // Modifying the elements
    audioElement.src = audioSrc;
    audioElement.hidden = true;
    audioElement.controls = false;

    completedTime.textContent = '0:00';
    seperator.textContent = '/';
    totalTime.textContent = '0:00';

    // Adding event listeners
    audioElement.ontimeupdate = (e) => {
      const { duration, currentTime } = e.srcElement;

      // Updating the visible slider
      const progressPercentage = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercentage}%`;

      // setting the total time
      const durationInMinutes = Math.floor(duration / 60);
      let durationInSeconds = Math.floor(duration % 60);

      if (durationInSeconds < 10) durationInSeconds = `0${durationInSeconds}`;

      if (durationInSeconds)
        totalTime.textContent = `${durationInMinutes}:${durationInSeconds}`;

      // Setting the completed time
      const durationDoneInMinutes = Math.floor(currentTime / 60);
      let durationDoneInSeconds = Math.floor(currentTime % 60);

      if (durationDoneInSeconds < 10)
        durationDoneInSeconds = `0${durationDoneInSeconds}`;

      if (durationDoneInSeconds)
        completedTime.textContent = `${durationDoneInMinutes}:${durationDoneInSeconds}`;
    };

    audioElement.onended = () => {
      if (audioControlBtn.classList.contains('fa-pause')) {
        audioControlBtn.classList.replace('fa-pause', 'fa-play');
      }
    };

    audioControlBtn.onclick = (e) => {
      const btn = e.srcElement;

      btn.classList.contains('fa-play')
        ? (btn.classList.replace('fa-play', 'fa-pause'), audioElement.play())
        : (btn.classList.replace('fa-pause', 'fa-play'), audioElement.pause());
    };

    progressBarContainer.onclick = (e) => {
      const width = progressBarContainer.clientWidth;
      const clientX = e.offsetX;

      const { duration } = audioElement;

      audioElement.currentTime = (clientX / width) * duration;
    };

    // Appending them to the parents
    durationContainer.appendChild(completedTime);
    durationContainer.appendChild(seperator);
    durationContainer.appendChild(totalTime);

    progressBarContainer.appendChild(progressBar);

    audioContainer.appendChild(audioElement);
    audioContainer.appendChild(audioControlBtn);
    audioContainer.appendChild(durationContainer);
    audioContainer.appendChild(progressBarContainer);

    resolve({ element: audioContainer });
  });
};

export const getOwnAudioElement = async (audioSrc) => {
  const getNewAudioElement = await customAudioElement(audioSrc);

  return getNewAudioElement.element;
};
