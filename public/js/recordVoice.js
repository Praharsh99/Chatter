export const recordVoice = () => {
  return new Promise((resolve) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      const start = () => {
        mediaRecorder.start();
      };

      const stop = () => {
        return new Promise((resolve) => {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks);
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            const play = () => {
              audio.play();
            };

            resolve({ audioBlob, audioUrl, play });
          };

          mediaRecorder.stop();
        });
      };

      resolve({ start, stop });
    });
  });
};

export const sleep = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));
