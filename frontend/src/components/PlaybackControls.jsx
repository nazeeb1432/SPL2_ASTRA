// import { useState } from "react";

// const PlaybackControls = ({ audioPath }) => {
//     const [audio, setAudio] = useState(null);

//     const playAudio = () => {
//         if (!audio) {
//             const newAudio = new Audio(audioPath);
//             setAudio(newAudio);
//             newAudio.play();
//         } else {
//             audio.play();
//         }
//     };

//     const pauseAudio = () => {
//         if (audio) audio.pause();
//     };

//     return (
//         <div className="mt-4">
//             <button onClick={playAudio}>Play</button>
//             <button onClick={pauseAudio}>Pause</button>
//         </div>
//     );
// };

// export default PlaybackControls;

import React from "react";
import ReactAudioPlayer from "react-audio-player";

const PlaybackControls = ({ audioPath }) => {
    return (
        <div className="mt-4">
            <ReactAudioPlayer
                src={audioPath}
                controls
                autoPlay={false}
                style={{ width: "100%" }}
            />
        </div>
    );
};

export default PlaybackControls;

