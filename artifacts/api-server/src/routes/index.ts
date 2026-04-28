import { Router, type IRouter } from "express";
import healthRouter from "./health";
import channelsRouter from "./channels";
import videosRouter from "./videos";
import overridesRouter from "./overrides";
import translateRouter from "./translate";
import synopsisRouter from "./synopsis";
import sitemapRouter from "./sitemap";
import articlesRouter from "./articles";
import feedRouter from "./feed";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(channelsRouter);
router.use(videosRouter);
router.use(overridesRouter);
router.use(translateRouter);
router.use(synopsisRouter);
router.use(sitemapRouter);
router.use(articlesRouter);
router.use(feedRouter);

export default router;
