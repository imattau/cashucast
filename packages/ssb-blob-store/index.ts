export default function createBlobStore(_opts: any) {
  return {
    add() {},
    get() {},
    rm() {},
    ls() { return []; },
    wants() { return []; },
  };
}
