import React, { useState, useEffect } from 'react';

/** Not in use atm. */

function Jitsi(): JSX.Element {
    const [loading, setLoading] = useState(true);
    const containerStyle = {
        width: '600px',
        height: '400px'
    };

    const jitsiContainerStyle = {
        display: loading ? 'none' : 'block',
        width: '100%',
        height: '100%'
    };

    function startConference(): void {
        try {
            const domain = 'meet.jit.si';
            const options = {
                roomName: 'sdusu77sdjs9dsn',
                height: 400,
                parentNode: document.getElementById('jitsi-container'),
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    SHOW_JITSI_WATERMARK: false
                },
                configOverwrite: {
                    disableSimulcast: false
                }
            };

            // @ts-ignore
            const api = new window.JitsiMeetExternalAPI(domain, options);
            api.addEventListener('videoConferenceJoined', () => {
                console.log('Local User Joined');
                setLoading(false);
                api.executeCommand('displayName', 'MyName');
            });
        } catch (error) {
            console.error('Failed to load Jitsi API', error);
        }
    }

    useEffect(() => {
        // verify the JitsiMeetExternalAPI constructor is added to the global..
        // @ts-ignore
        if (window.JitsiMeetExternalAPI) {
            startConference();
        } else {
            alert('Jitsi Meet API script not loaded');
        }
    }, []);

    return (
        <div className="absolute left-0 bottom-0 z-30" style={containerStyle}>
            <button>Start</button>
            {loading && <p>loading</p>}
            <div id="jitsi-container" style={jitsiContainerStyle} />
        </div>
    );
}

export default Jitsi;
