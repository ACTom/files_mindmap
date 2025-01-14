import FilesMindMap from './mindmap'
import logger from './logger'

import { getSharingToken, isPublicShare } from '@nextcloud/sharing/public'

if (isPublicShare()) {
	OCA.FilesMindMap = FilesMindMap;
	FilesMindMap.init();

    if (FilesMindMap.isMindmapPublic()) {
        window.addEventListener('DOMContentLoaded', function() {
            var sharingToken = getSharingToken();
            var downloadUrl = OC.generateUrl('/s/{token}/download', {token: sharingToken});
            var viewer = OCA.FilesMindMap;


            const contentElmt = document.getElementById('files-public-content');
            const footerElmt = document.querySelector('body > footer') || document.querySelector('#app-content > footer');
            if (contentElmt) {
                if (OCA.Viewer) {
                    contentElmt.innerHTML = '';
                    OCA.Viewer.setRootElement('#files-public-content')
				    OCA.Viewer.open({ path: '/' });

                    footerElmt.style.display = 'none';

                    // This is an ugly implementation, need to remove the top margin after viewer creates the iframe
                    setTimeout(() => {
                        const frameElmt = document.querySelector('#viewer > iframe');
                        if (frameElmt) {
                            frameElmt.style.marginTop = '0';
                        }
                    }, 1000);

                } else {
                    logger.error('Viewer is not available, cannot preview mindmap');
                }
            }

        });
    }
    
    
    console.log('files_mindmap public.js loaded');
}