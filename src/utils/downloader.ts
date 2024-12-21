import axios from "axios";
import * as fs from "fs";
export function downloadFromGithubRelease(
    owner: string, repo: string, tagName: string, assetName: string,
    targetPath: string
) {
    axios.get(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tagName}`)
        .then(response => {
            const release = response.data;
            const asset = release.assets.find((a: {name:string} )=> a.name === assetName);
            if (!asset) {
                throw new Error(`Asset '${assetName}' not found in release '${tagName}'`);
            }
            const assetUrl = asset.browser_download_url;

            // 下载资产
            return axios({
                url: assetUrl,
                method: 'GET',
                responseType: 'stream'
            });
        })
        .then(response => {
            const writer = fs.createWriteStream(targetPath);

            return new Promise((resolve, reject) => {
                response.data.pipe(writer);

                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        })
        .then(() => {
            console.log(`Downloaded ${assetName} successfully!`);
        })
        .catch(error => {
            console.error(`Error downloading asset: ${error.message}`);
        });
}