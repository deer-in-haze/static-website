function build_usno_url(coordinates) {
    const timezone = -new Date().getTimezoneOffset() / 60; // east-positive
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    return (
        "https://aa.usno.navy.mil/api/rstt/oneday" +
        `?date=${encodeURIComponent(date)}` +
        `&coords=${encodeURIComponent(`${coordinates.lat},${coordinates.lon}`)}` +
        `&tz=${encodeURIComponent(timezone)}`
    );
}