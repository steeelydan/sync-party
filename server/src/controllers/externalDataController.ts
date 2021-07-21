import { Logger } from 'winston';
import { Request, Response } from 'express';
import got from 'got';
import cheerio from 'cheerio';

const getLinkMetadata = async (req: Request, res: Response, logger: Logger) => {
    let url;

    try {
        url = new URL(req.body.url);
    } catch (error) {
        return res.status(404);
    }

    const origin = url.origin;
    const pathname = url.pathname;
    const videoId = url.searchParams.get('v');
    const videoIdRegex = /[a-zA-Z0-9\-_]/;

    if (
        videoId &&
        req.user &&
        origin === 'https://www.youtube.com' &&
        pathname === '/watch' &&
        videoIdRegex.test(videoId) &&
        videoId.length < 20
    ) {
        const requestUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const result = { videoTitle: '', channelTitle: '' };

        logger.log(
            'info',
            `External request: User ${req.user.id} requested link metadata from ${requestUrl}`
        );

        try {
            const response = await got(requestUrl, { timeout: 3000 });

            const $ = cheerio.load(response.body);
            result.videoTitle = $("meta[property='og:title']").attr('content') || '';
            result.channelTitle = $("*[itemprop = 'author']")
                .find('link:nth-child(2)')
                .attr('content') || '';
        } catch (error) {
            return res.status(404);
        }

        return res.json(result);
    } else {
        return res.status(404);
    }
};

export default { getLinkMetadata };
