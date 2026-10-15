import proxy from "express-http-proxy";

export const proxyWithHeader = (
  serviceUrl,
  { keepFullPath = true, raw = false } = {},
) => {
  return proxy(serviceUrl, {
    parseReqBody: !raw,

    proxyReqPathResolver: (req) => {
      return keepFullPath ? req.originalUrl : req.url;
    },

    proxyReqBodyDecorator: raw
      ? undefined
      : (bodyContent, srcReq) => {
          if (srcReq.body && Object.keys(srcReq.body).length > 0) {
            return JSON.stringify(srcReq.body);
          }
          return bodyContent;
        },

    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      const contentType = srcReq.headers["content-type"] || "";
      const isMultipart = contentType.includes("multipart/form-data");

      if (
        !raw &&
        !isMultipart &&
        srcReq.body &&
        Object.keys(srcReq.body).length > 0
      ) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      const userId =
        srcReq.user?.userId ||
        srcReq.user?._id ||
        srcReq.user?.id ||
        srcReq.user?.uid;

      if (userId) {
        proxyReqOpts.headers["x-user-id"] = String(userId);
      }

      return proxyReqOpts;
    },
  });
};
