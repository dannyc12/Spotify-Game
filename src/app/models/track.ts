import Artist from "./artist";

export default interface Track {
    id: string,
    name: string,
    // artists: Artist[],
    previewUrl: string,
    detailsUrl: string


}