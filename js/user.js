const default_coords = { lat: 54.6872, lon: 25.2797 }; // vilnius

function get_user_location() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                });
            },
            (err) => {
                reject(err);
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 60_000,
            }
        );
    });
}