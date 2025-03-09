// import React from "react";
// import ReactAudioPlayer from "react-audio-player";

// const PlaybackControls = ({ audioPath }) => {
//     return (
//         <div className="mt-4">
//             <ReactAudioPlayer
//                 src={audioPath}
//                 controls
//                 autoPlay={false}
//                 style={{ width: "100%" }}
//             />
//         </div>
//     );
// };

// export default PlaybackControls;


import React, { useEffect, useRef } from "react";
import ReactAudioPlayer from "react-audio-player";

const PlaybackControls = ({ audioPath, playbackSpeed }) => {
    const audioPlayerRef = useRef(null);

    useEffect(() => {
        if (audioPlayerRef.current && audioPlayerRef.current.audioEl && audioPlayerRef.current.audioEl.current) {
            audioPlayerRef.current.audioEl.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed, audioPath]);

    console.log("PlaybackControls: audioPath =", audioPath); // Log the audioPath

    return (
        <div className="mt-4">
            <ReactAudioPlayer
                ref={audioPlayerRef}
                src={audioPath}
                controls
                autoPlay={false}
                style={{ width: "100%" }}
            />
        </div>
    );
};

export default PlaybackControls;

