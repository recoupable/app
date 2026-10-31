export function createControlledImage(
  loaders: HTMLImageElement[],
  isCached: () => boolean,
) {
  return function () {
    const image = document.createElement("img");
    let src = "";
    let complete = isCached();
    let naturalWidth = isCached() ? 100 : 0;
    Object.defineProperties(image, {
      src: {
        get: () => src,
        set: (value: string) => {
          src = value;
          complete = isCached();
          naturalWidth = isCached() ? 100 : 0;
        },
      },
      complete: { get: () => complete },
      naturalWidth: { get: () => naturalWidth },
    });
    image.addEventListener("load", () => {
      complete = true;
      naturalWidth = 100;
    });
    image.addEventListener("error", () => {
      complete = true;
      naturalWidth = 0;
    });
    loaders.push(image);
    return image;
  };
}
