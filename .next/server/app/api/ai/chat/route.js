"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/ai/chat/route";
exports.ids = ["app/api/ai/chat/route"];
exports.modules = {

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!*******************************************************************************!*\
  !*** external "next/dist/client/components/action-async-storage.external.js" ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!********************************************************************************!*\
  !*** external "next/dist/client/components/request-async-storage.external.js" ***!
  \********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!******************************************************************************************!*\
  !*** external "next/dist/client/components/static-generation-async-storage.external.js" ***!
  \******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/client/components/static-generation-async-storage.external.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fai%2Fchat%2Froute&page=%2Fapi%2Fai%2Fchat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fai%2Fchat%2Froute.ts&appDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fai%2Fchat%2Froute&page=%2Fapi%2Fai%2Fchat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fai%2Fchat%2Froute.ts&appDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Ritika_Desktop_tradespere_app_api_ai_chat_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/ai/chat/route.ts */ \"(rsc)/./app/api/ai/chat/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/ai/chat/route\",\n        pathname: \"/api/ai/chat\",\n        filename: \"route\",\n        bundlePath: \"app/api/ai/chat/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Ritika\\\\Desktop\\\\tradespere\\\\app\\\\api\\\\ai\\\\chat\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Ritika_Desktop_tradespere_app_api_ai_chat_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/ai/chat/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhaSUyRmNoYXQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFpJTJGY2hhdCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFpJTJGY2hhdCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNSaXRpa2ElNUNEZXNrdG9wJTVDdHJhZGVzcGVyZSU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDUml0aWthJTVDRGVza3RvcCU1Q3RyYWRlc3BlcmUmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ29CO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJhZGVzcGVyZS8/YmVmMiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvZnV0dXJlL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCJDOlxcXFxVc2Vyc1xcXFxSaXRpa2FcXFxcRGVza3RvcFxcXFx0cmFkZXNwZXJlXFxcXGFwcFxcXFxhcGlcXFxcYWlcXFxcY2hhdFxcXFxyb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYWkvY2hhdC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2FpL2NoYXRcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FpL2NoYXQvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxSaXRpa2FcXFxcRGVza3RvcFxcXFx0cmFkZXNwZXJlXFxcXGFwcFxcXFxhcGlcXFxcYWlcXFxcY2hhdFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYWkvY2hhdC9yb3V0ZVwiO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICBzZXJ2ZXJIb29rcyxcbiAgICAgICAgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fai%2Fchat%2Froute&page=%2Fapi%2Fai%2Fchat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fai%2Fchat%2Froute.ts&appDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/ai/chat/route.ts":
/*!**********************************!*\
  !*** ./app/api/ai/chat/route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/auth */ \"(rsc)/./lib/auth.ts\");\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n/* harmony import */ var groq_sdk__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! groq-sdk */ \"(rsc)/./node_modules/groq-sdk/index.mjs\");\n\n\n\n\n\nconst GROQ_API_KEY = process.env.GROQ_API_KEY;\nconst GROQ_MODEL = process.env.GROQ_MODEL || \"llama-3.3-70b-versatile\";\nconsole.log(\"GROQ_API_KEY loaded:\", !!GROQ_API_KEY, \"model:\", GROQ_MODEL); // debug only\nasync function POST(request) {\n    const session = await (0,next_auth__WEBPACK_IMPORTED_MODULE_1__.getServerSession)(_lib_auth__WEBPACK_IMPORTED_MODULE_2__.authOptions);\n    if (!session?.user?.id) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Unauthorized\"\n        }, {\n            status: 401\n        });\n    }\n    if (!GROQ_API_KEY) {\n        const err = \"GROQ_API_KEY not configured\";\n        console.error(err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: err\n        }, {\n            status: 500\n        });\n    }\n    const groqClient = new groq_sdk__WEBPACK_IMPORTED_MODULE_4__[\"default\"]({\n        apiKey: GROQ_API_KEY\n    });\n    const body = await request.json();\n    const question = String(body.question || \"\").trim();\n    if (!question) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Question is required\"\n        }, {\n            status: 400\n        });\n    }\n    const trades = await _lib_prisma__WEBPACK_IMPORTED_MODULE_3__[\"default\"].trade.findMany({\n        where: {\n            userId: session.user.id\n        },\n        orderBy: {\n            createdAt: \"asc\"\n        }\n    });\n    const history = trades.map((trade)=>({\n            date: trade.createdAt.toISOString(),\n            stock: trade.stock,\n            type: trade.type,\n            price: trade.price,\n            quantity: trade.quantity,\n            pnl: trade.pnl,\n            mood: trade.mood\n        }));\n    const prompt = `You are a trading coach. Here is the user's trade history: ${JSON.stringify(history)}. The user asks: ${question}. Provide a concise coaching response.`;\n    try {\n        const result = await groqClient.chat.completions.create({\n            model: GROQ_MODEL,\n            messages: [\n                {\n                    role: \"system\",\n                    content: \"You are a supportive trading coach.\"\n                },\n                {\n                    role: \"user\",\n                    content: prompt\n                }\n            ],\n            max_tokens: 500,\n            temperature: 0.9\n        });\n        const answer = result?.choices?.[0]?.message?.content || \"\";\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            answer\n        });\n    } catch (error) {\n        console.error(\"Groq chat error:\", error);\n        const details = error instanceof Error ? error.message : JSON.stringify(error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"AI coach request failed\",\n            details\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJhZGVzcGVyZS8uL2FwcC9hcGkvYWkvY2hhdC9yb3V0ZS50cz9iNDAyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgZ2V0U2VydmVyU2Vzc2lvbiB9IGZyb20gXCJuZXh0LWF1dGhcIjtcclxuaW1wb3J0IHsgYXV0aE9wdGlvbnMgfSBmcm9tIFwiQC9saWIvYXV0aFwiO1xyXG5pbXBvcnQgcHJpc21hIGZyb20gXCJAL2xpYi9wcmlzbWFcIjtcclxuaW1wb3J0IEdyb3EgZnJvbSBcImdyb3Etc2RrXCI7XHJcblxyXG5jb25zdCBHUk9RX0FQSV9LRVkgPSBwcm9jZXNzLmVudi5HUk9RX0FQSV9LRVk7XHJcbmNvbnN0IEdST1FfTU9ERUwgPSBwcm9jZXNzLmVudi5HUk9RX01PREVMIHx8IFwibGxhbWEtMy4zLTcwYi12ZXJzYXRpbGVcIjtcclxuY29uc29sZS5sb2coXCJHUk9RX0FQSV9LRVkgbG9hZGVkOlwiLCAhIUdST1FfQVBJX0tFWSwgXCJtb2RlbDpcIiwgR1JPUV9NT0RFTCk7IC8vIGRlYnVnIG9ubHlcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGdldFNlcnZlclNlc3Npb24oYXV0aE9wdGlvbnMpO1xyXG4gIGlmICghc2Vzc2lvbj8udXNlcj8uaWQpIHtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBcIlVuYXV0aG9yaXplZFwiIH0sIHsgc3RhdHVzOiA0MDEgfSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIUdST1FfQVBJX0tFWSkge1xyXG4gICAgY29uc3QgZXJyID0gXCJHUk9RX0FQSV9LRVkgbm90IGNvbmZpZ3VyZWRcIjtcclxuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGVycm9yOiBlcnIgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGdyb3FDbGllbnQgPSBuZXcgR3JvcSh7IGFwaUtleTogR1JPUV9BUElfS0VZIH0pO1xyXG5cclxuICBjb25zdCBib2R5ID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XHJcbiAgY29uc3QgcXVlc3Rpb24gPSBTdHJpbmcoYm9keS5xdWVzdGlvbiB8fCBcIlwiKS50cmltKCk7XHJcbiAgaWYgKCFxdWVzdGlvbikge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiUXVlc3Rpb24gaXMgcmVxdWlyZWRcIiB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdHJhZGVzID0gYXdhaXQgcHJpc21hLnRyYWRlLmZpbmRNYW55KHtcclxuICAgIHdoZXJlOiB7IHVzZXJJZDogc2Vzc2lvbi51c2VyLmlkIH0sXHJcbiAgICBvcmRlckJ5OiB7IGNyZWF0ZWRBdDogXCJhc2NcIiB9LFxyXG4gIH0pO1xyXG5cclxuICBjb25zdCBoaXN0b3J5ID0gdHJhZGVzLm1hcCgodHJhZGUpID0+ICh7XHJcbiAgICBkYXRlOiB0cmFkZS5jcmVhdGVkQXQudG9JU09TdHJpbmcoKSxcclxuICAgIHN0b2NrOiB0cmFkZS5zdG9jayxcclxuICAgIHR5cGU6IHRyYWRlLnR5cGUsXHJcbiAgICBwcmljZTogdHJhZGUucHJpY2UsXHJcbiAgICBxdWFudGl0eTogdHJhZGUucXVhbnRpdHksXHJcbiAgICBwbmw6IHRyYWRlLnBubCxcclxuICAgIG1vb2Q6IHRyYWRlLm1vb2QsXHJcbiAgfSkpO1xyXG5cclxuICBjb25zdCBwcm9tcHQgPSBgWW91IGFyZSBhIHRyYWRpbmcgY29hY2guIEhlcmUgaXMgdGhlIHVzZXIncyB0cmFkZSBoaXN0b3J5OiAke0pTT04uc3RyaW5naWZ5KGhpc3RvcnkpfS4gVGhlIHVzZXIgYXNrczogJHtxdWVzdGlvbn0uIFByb3ZpZGUgYSBjb25jaXNlIGNvYWNoaW5nIHJlc3BvbnNlLmA7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBncm9xQ2xpZW50LmNoYXQuY29tcGxldGlvbnMuY3JlYXRlKHtcclxuICAgICAgbW9kZWw6IEdST1FfTU9ERUwsXHJcbiAgICAgIG1lc3NhZ2VzOiBbXHJcbiAgICAgICAgeyByb2xlOiBcInN5c3RlbVwiLCBjb250ZW50OiBcIllvdSBhcmUgYSBzdXBwb3J0aXZlIHRyYWRpbmcgY29hY2guXCIgfSxcclxuICAgICAgICB7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBwcm9tcHQgfSxcclxuICAgICAgXSxcclxuICAgICAgbWF4X3Rva2VuczogNTAwLFxyXG4gICAgICB0ZW1wZXJhdHVyZTogMC45LFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgYW5zd2VyID0gcmVzdWx0Py5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQgfHwgXCJcIjtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGFuc3dlciB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkdyb3EgY2hhdCBlcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgY29uc3QgZGV0YWlscyA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogSlNPTi5zdHJpbmdpZnkoZXJyb3IpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6IFwiQUkgY29hY2ggcmVxdWVzdCBmYWlsZWRcIiwgZGV0YWlscyB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiZ2V0U2VydmVyU2Vzc2lvbiIsImF1dGhPcHRpb25zIiwicHJpc21hIiwiR3JvcSIsIkdST1FfQVBJX0tFWSIsInByb2Nlc3MiLCJlbnYiLCJHUk9RX01PREVMIiwiY29uc29sZSIsImxvZyIsIlBPU1QiLCJyZXF1ZXN0Iiwic2Vzc2lvbiIsInVzZXIiLCJpZCIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImVyciIsImdyb3FDbGllbnQiLCJhcGlLZXkiLCJib2R5IiwicXVlc3Rpb24iLCJTdHJpbmciLCJ0cmltIiwidHJhZGVzIiwidHJhZGUiLCJmaW5kTWFueSIsIndoZXJlIiwidXNlcklkIiwib3JkZXJCeSIsImNyZWF0ZWRBdCIsImhpc3RvcnkiLCJtYXAiLCJkYXRlIiwidG9JU09TdHJpbmciLCJzdG9jayIsInR5cGUiLCJwcmljZSIsInF1YW50aXR5IiwicG5sIiwibW9vZCIsInByb21wdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXN1bHQiLCJjaGF0IiwiY29tcGxldGlvbnMiLCJjcmVhdGUiLCJtb2RlbCIsIm1lc3NhZ2VzIiwicm9sZSIsImNvbnRlbnQiLCJtYXhfdG9rZW5zIiwidGVtcGVyYXR1cmUiLCJhbnN3ZXIiLCJjaG9pY2VzIiwibWVzc2FnZSIsImRldGFpbHMiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/ai/chat/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/auth.ts":
/*!*********************!*\
  !*** ./lib/auth.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   authOptions: () => (/* binding */ authOptions)\n/* harmony export */ });\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/prisma */ \"(rsc)/./lib/prisma.ts\");\n\n\n\nconst authOptions = {\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Password\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials.password) {\n                    return null;\n                }\n                const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_2__[\"default\"].user.findUnique({\n                    where: {\n                        email: credentials.email.toLowerCase()\n                    }\n                });\n                if (!user) return null;\n                const isValid = await (0,bcryptjs__WEBPACK_IMPORTED_MODULE_1__.compare)(credentials.password, user.password);\n                if (!isValid) return null;\n                return {\n                    id: user.id,\n                    email: user.email\n                };\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\"\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\"\n    }\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvYXV0aC50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFrRTtBQUMvQjtBQUNEO0FBRTNCLE1BQU1HLGNBQWM7SUFDekJDLFdBQVc7UUFDVEosMkVBQW1CQSxDQUFDO1lBQ2xCSyxNQUFNO1lBQ05DLGFBQWE7Z0JBQ1hDLE9BQU87b0JBQUVDLE9BQU87b0JBQVNDLE1BQU07Z0JBQVE7Z0JBQ3ZDQyxVQUFVO29CQUFFRixPQUFPO29CQUFZQyxNQUFNO2dCQUFXO1lBQ2xEO1lBQ0EsTUFBTUUsV0FBVUwsV0FBVztnQkFDekIsSUFBSSxDQUFDQSxhQUFhQyxTQUFTLENBQUNELFlBQVlJLFFBQVEsRUFBRTtvQkFDaEQsT0FBTztnQkFDVDtnQkFFQSxNQUFNRSxPQUFPLE1BQU1WLG1EQUFNQSxDQUFDVSxJQUFJLENBQUNDLFVBQVUsQ0FBQztvQkFDeENDLE9BQU87d0JBQUVQLE9BQU9ELFlBQVlDLEtBQUssQ0FBQ1EsV0FBVztvQkFBRztnQkFDbEQ7Z0JBRUEsSUFBSSxDQUFDSCxNQUFNLE9BQU87Z0JBRWxCLE1BQU1JLFVBQVUsTUFBTWYsaURBQU9BLENBQUNLLFlBQVlJLFFBQVEsRUFBRUUsS0FBS0YsUUFBUTtnQkFDakUsSUFBSSxDQUFDTSxTQUFTLE9BQU87Z0JBRXJCLE9BQU87b0JBQ0xDLElBQUlMLEtBQUtLLEVBQUU7b0JBQ1hWLE9BQU9LLEtBQUtMLEtBQUs7Z0JBQ25CO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RXLFNBQVM7UUFDUEMsVUFBVTtJQUNaO0lBQ0FDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRVYsSUFBSSxFQUE4QjtZQUNuRCxJQUFJQSxNQUFNO2dCQUNSVSxNQUFNTCxFQUFFLEdBQUcsS0FBY0EsRUFBRTtZQUM3QjtZQUNBLE9BQU9LO1FBQ1Q7UUFDQSxNQUFNSixTQUFRLEVBQUVBLE9BQU8sRUFBRUksS0FBSyxFQUFnQztZQUM1RCxJQUFJSixRQUFRTixJQUFJLEVBQUU7Z0JBQ2hCTSxRQUFRTixJQUFJLENBQUNLLEVBQUUsR0FBR0ssTUFBTUwsRUFBRTtZQUM1QjtZQUNBLE9BQU9DO1FBQ1Q7SUFDRjtJQUNBSyxPQUFPO1FBQ0xDLFFBQVE7SUFDVjtBQUNGLEVBQUUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90cmFkZXNwZXJlLy4vbGliL2F1dGgudHM/YmY3ZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ3JlZGVudGlhbHNQcm92aWRlciBmcm9tIFwibmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFsc1wiO1xyXG5pbXBvcnQgeyBjb21wYXJlIH0gZnJvbSBcImJjcnlwdGpzXCI7XHJcbmltcG9ydCBwcmlzbWEgZnJvbSBcIkAvbGliL3ByaXNtYVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGF1dGhPcHRpb25zID0ge1xyXG4gIHByb3ZpZGVyczogW1xyXG4gICAgQ3JlZGVudGlhbHNQcm92aWRlcih7XHJcbiAgICAgIG5hbWU6IFwiQ3JlZGVudGlhbHNcIixcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBlbWFpbDogeyBsYWJlbDogXCJFbWFpbFwiLCB0eXBlOiBcImVtYWlsXCIgfSxcclxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJQYXNzd29yZFwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfSxcclxuICAgICAgfSxcclxuICAgICAgYXN5bmMgYXV0aG9yaXplKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAgICAgaWYgKCFjcmVkZW50aWFscz8uZW1haWwgfHwgIWNyZWRlbnRpYWxzLnBhc3N3b3JkKSB7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBwcmlzbWEudXNlci5maW5kVW5pcXVlKHtcclxuICAgICAgICAgIHdoZXJlOiB7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbC50b0xvd2VyQ2FzZSgpIH0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICghdXNlcikgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IGlzVmFsaWQgPSBhd2FpdCBjb21wYXJlKGNyZWRlbnRpYWxzLnBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkKTtcclxuICAgICAgICBpZiAoIWlzVmFsaWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcclxuICAgICAgICB9O1xyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxuICBzZXNzaW9uOiB7XHJcbiAgICBzdHJhdGVneTogXCJqd3RcIiBhcyBjb25zdCxcclxuICB9LFxyXG4gIGNhbGxiYWNrczoge1xyXG4gICAgYXN5bmMgand0KHsgdG9rZW4sIHVzZXIgfTogeyB0b2tlbjogYW55OyB1c2VyPzogYW55IH0pIHtcclxuICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICB0b2tlbi5pZCA9ICh1c2VyIGFzIGFueSkuaWQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNlc3Npb24oeyBzZXNzaW9uLCB0b2tlbiB9OiB7IHNlc3Npb246IGFueTsgdG9rZW46IGFueSB9KSB7XHJcbiAgICAgIGlmIChzZXNzaW9uLnVzZXIpIHtcclxuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZCBhcyBzdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlc3Npb247XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGFnZXM6IHtcclxuICAgIHNpZ25JbjogXCIvbG9naW5cIixcclxuICB9LFxyXG59O1xyXG4iXSwibmFtZXMiOlsiQ3JlZGVudGlhbHNQcm92aWRlciIsImNvbXBhcmUiLCJwcmlzbWEiLCJhdXRoT3B0aW9ucyIsInByb3ZpZGVycyIsIm5hbWUiLCJjcmVkZW50aWFscyIsImVtYWlsIiwibGFiZWwiLCJ0eXBlIiwicGFzc3dvcmQiLCJhdXRob3JpemUiLCJ1c2VyIiwiZmluZFVuaXF1ZSIsIndoZXJlIiwidG9Mb3dlckNhc2UiLCJpc1ZhbGlkIiwiaWQiLCJzZXNzaW9uIiwic3RyYXRlZ3kiLCJjYWxsYmFja3MiLCJqd3QiLCJ0b2tlbiIsInBhZ2VzIiwic2lnbkluIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/auth.ts\n");

/***/ }),

/***/ "(rsc)/./lib/prisma.ts":
/*!***********************!*\
  !*** ./lib/prisma.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @prisma/client */ \"@prisma/client\");\n/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);\n\nconst prisma = global.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();\nif (true) global.prisma = prisma;\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (prisma);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvcHJpc21hLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUE4QztBQVE5QyxNQUFNQyxTQUFTQyxPQUFPRCxNQUFNLElBQUksSUFBSUQsd0RBQVlBO0FBRWhELElBQUlHLElBQXFDLEVBQUVELE9BQU9ELE1BQU0sR0FBR0E7QUFFM0QsaUVBQWVBLE1BQU1BLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90cmFkZXNwZXJlLy4vbGliL3ByaXNtYS50cz85ODIyIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gXCJAcHJpc21hL2NsaWVudFwiO1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIC8vIEFsbG93IGdsb2JhbCBjYWNoaW5nIGluIGRldmVsb3BtZW50IHRvIGF2b2lkIG11bHRpcGxlIGluc3RhbmNlcyBkdXJpbmcgaG90IHJlbG9hZC5cclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdmFyXHJcbiAgdmFyIHByaXNtYTogUHJpc21hQ2xpZW50IHwgdW5kZWZpbmVkO1xyXG59XHJcblxyXG5jb25zdCBwcmlzbWEgPSBnbG9iYWwucHJpc21hID8/IG5ldyBQcmlzbWFDbGllbnQoKTtcclxuXHJcbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIGdsb2JhbC5wcmlzbWEgPSBwcmlzbWE7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBwcmlzbWE7XHJcbiJdLCJuYW1lcyI6WyJQcmlzbWFDbGllbnQiLCJwcmlzbWEiLCJnbG9iYWwiLCJwcm9jZXNzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/prisma.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/jose","vendor-chunks/next-auth","vendor-chunks/groq-sdk","vendor-chunks/openid-client","vendor-chunks/@babel","vendor-chunks/uuid","vendor-chunks/oauth","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/bcryptjs","vendor-chunks/preact","vendor-chunks/oidc-token-hash","vendor-chunks/object-hash","vendor-chunks/lru-cache","vendor-chunks/cookie"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fai%2Fchat%2Froute&page=%2Fapi%2Fai%2Fchat%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fai%2Fchat%2Froute.ts&appDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CRitika%5CDesktop%5Ctradespere&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();