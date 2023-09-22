<?php
namespace OCA\Files_MindMap\Migration;

require \OC::$SERVERROOT . "/3rdparty/autoload.php";

use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;
use OCP\ILogger;
use OC\Core\Command\Maintenance\Mimetype\UpdateJS;
use Symfony\Component\Console\Input\StringInput;
use Symfony\Component\Console\Output\ConsoleOutput;

class InstallStep implements IRepairStep {

    /** @var ILogger */
    protected $logger;
    protected $updateJS;

    public function __construct(ILogger $logger, UpdateJS $updateJS) {
            $this->logger = $logger;
            $this->updateJS = $updateJS;
    }

    /**
    * Returns the step's name
    */
    public function getName() {
            return 'Install MindMap';
    }

    /**
    * @param IOutput $output
    */
    public function run(IOutput $output) {
        $currentVersion = implode('.', \OC_Util::getVersion());

        if (version_compare($currentVersion, '21.0.0.11', '<')) {
            /* Since 21.0.0 beta4, NC has mindmap's mimetype icon */
            $this->logger->info("Copy mindmap icon to core/img directory.", ["app" => "files_mindmap"]);
            $appImagePath = __DIR__ . '/../../img/mindmap.svg';
            $coreImagePath = \OC::$SERVERROOT . '/core/img/filetypes/mindmap.svg';
            if (!file_exists($coreImagePath) || md5_file($coreImagePath) !== md5_file($appImagePath)) {
                copy($appImagePath, $coreImagePath);
            }
        }    
    }
}
