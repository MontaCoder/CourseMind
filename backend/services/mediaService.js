import { createApi } from 'unsplash-js';
import youtubesearchapi from 'youtube-search-api';
import { YoutubeTranscript } from 'youtube-transcript';
import { config } from '../config/environment.js';

const unsplash = createApi({ accessKey: config.api.unsplash });

export class MediaService {
    static async searchImage(query) {
        const result = await unsplash.search.getPhotos({
            query,
            page: 1,
            perPage: 1,
            orientation: 'landscape',
        });

        if (result.response && result.response.results.length > 0) {
            return result.response.results[0].urls.regular;
        }
        return null;
    }

    static async searchVideo(query) {
        const video = await youtubesearchapi.GetListByKeyword(query, [false], [1], [{ type: 'video' }]);
        return video.items[0].id;
    }

    static async getVideoTranscript(videoId) {
        return await YoutubeTranscript.fetchTranscript(videoId);
    }
}

