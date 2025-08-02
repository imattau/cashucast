export function getSSB() {
  return {
    blobs: {
      add() {
        return {
          write(_data: any) {},
          end(cb: (err: any, hash: string) => void) {
            cb && cb(null, Math.random().toString(36).slice(2));
          },
        };
      },
      get(_hash: string, cb: (err: any, stream?: any) => void) {
        cb(new Error('not found'));
      },
      rm(_hash: string, cb?: () => void) {
        cb && cb();
      },
    },
  };
}
