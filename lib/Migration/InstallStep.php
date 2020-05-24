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

        $this->logger->info("Copy mindmap icon to core/img directory.", ["app" => "files_mindmap"]);
        $appImagePath = __DIR__ . '/../../img/mindmap.svg';
        $coreImagePath = \OC::$SERVERROOT . '/core/img/filetypes/mindmap.svg';
        if (!file_exists($coreImagePath) || md5_file($coreImagePath) !== md5_file($appImagePath)) {
            copy($appImagePath, $coreImagePath);
        }

        if (version_compare($currentVersion, '19.0.0.4', '<')) {
            /* Since 19.0.0.beta3, NC has mindmap's mimetype */
            $configDir = \OC::$configDir;
            $mimetypealiasesFile = $configDir . 'mimetypealiases.json';
            $mimetypemappingFile = $configDir . 'mimetypemapping.json';

            $this->appendToFile($mimetypealiasesFile, ['application/km' => 'mindmap', 'application/x-freemind' => 'mindmap', 'application/vnd.xmind.workbook' => 'mindmap']);
            $this->appendToFile($mimetypemappingFile, ['km' => ['application/km'], 'mm' => ['application/x-freemind'], 'xmind' => ['application/vnd.xmind.workbook']]);
            $this->logger->info("Add .km,.mm,.xmind to mimetype list.", ["app" => "files_mindmap"]);
            $this->updateJS->run(new StringInput(''), new ConsoleOutput());
        }        
    }

    private function appendToFile(string $filename, array $data) {
        $obj = [];
        if (file_exists($filename)) {
            $content = file_get_contents($filename);
            $obj = json_decode($content, true);
        }
        foreach ($data as $key => $value) {
            $obj[$key] = $value;
        }
        file_put_contents($filename, json_encode($obj,  JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    }
}
