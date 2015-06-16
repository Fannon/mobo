ABOUT MOBO
---------------------------------------------------------------------------------------
Mobo is a command line toolset that helps building Semantic MediaWiki structure 
in an agile, model driven engineering (MDE) way.

See: https://github.com/Fannon/mobo

CONSOLE COMMANDS
---------------------------------------------------------------------------------------

--version           (-v)    Display version
--help              (-h)    Display help text
--settings          (-s)    Displays current settings
                            Includes inherited and calculated settings

--update            (-u)    Updates the project mobo_templates to the latest version
                            This might be necessary if new features are introduced.
                            Creates a backup from your current templates first.

--init              (i)     Creates a new raw project in the current directory
--example hardware          Installs the "hardware" sample project

--force             (-f)    Forces the upload of the complete model
--run-through       (-r)    Skips watching the filesystem and serving the webapp.
                            Mobo will exit after completion. (for CLI usage)

--skip-upload               Skips uploading and deleting on the external wiki

--import <directory>        Imports all files from /import/<director> to the wiki

--nuke content              Nukes all main content wiki pages
--nuke structure            Nukes all structural wiki pages (templates, categories, ...)
--nuke custom-namespaces    Nukes all content from custom namespaces
--nuke <namespaceNumber>    Nukes the namespace of the given number
