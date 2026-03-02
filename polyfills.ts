
import { Buffer } from 'buffer';

// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.global = window;
    // @ts-ignore
    window.Buffer = Buffer;
    // @ts-ignore
    window.process = {
        env: { DEBUG: undefined },
        version: '',
        // @ts-ignore
        nextTick: (cb) => setTimeout(cb, 0),
    };
}
