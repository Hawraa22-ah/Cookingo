// // // // src/global.d.ts
// // // import React from 'react';

// // // declare global {
// // //   namespace JSX {
// // //     interface IntrinsicElements {
// // //       'df-messenger': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
// // //     }
// // //   }
// // // }
// // // export {};
// // // src/global.d.ts
// // import React from 'react';

// // declare global {
// //   namespace JSX {
// //     interface IntrinsicElements {
// //       'df-messenger': React.DetailedHTMLProps<
// //         React.HTMLAttributes<HTMLElement>,
// //         HTMLElement
// //       >;
// //     }
// //   }
// // }

// // export {};
// // src/global.d.ts
// import React from 'react';
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'df-messenger': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
//     }
//   }
// }
// export {};

// src/global.d.ts
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Allow <df-messenger> in JSX
      'df-messenger': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
