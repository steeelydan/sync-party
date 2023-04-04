import axios from 'axios';
import cheerio from 'cheerio';

import type { Request, Response } from 'express';
import type { Logger } from 'winston';

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
            const response = await axios.get(requestUrl, { timeout: 3000 });

            const $ = cheerio.load(response.data);

            let author;

            try {
                const authorPos = response.data.indexOf('"author":') + 10;
                const authorRaw = response.data.slice(
                    authorPos,
                    authorPos + 100
                );

                author = authorRaw.slice(0, authorRaw.indexOf('"'));
            } catch (e) {
                author = '';
            }

            result.videoTitle =
                $("meta[property='og:title']").attr('content') || '';
            result.channelTitle = author;
        } catch (error) {
            return res.status(404);
        }

        return res.json(result);
    } else {
        return res.status(404);
    }
};

export default { getLinkMetadata };
