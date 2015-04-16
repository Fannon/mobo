ABOUT MOBO
----------
Mobo is a command line toolset that helps building Semantic MediaWiki structure in an agile, model driven engineering (MDE) way.

For documentation please head over to: https://github.com/Fannon/mobo

CONSOLE COMMANDS
----------------

--version           (-v)    Display version
--help              (-h)    Display help text
--settings          (-s)    Displays current settings
                            Includes inherited and calculated settings

--update            (-u)    Updates the project mobo_templates to the latest mobo_templates
                            This might be necessary if new features are introduced.
                            Creates a Backup from your current templates first.

--init              (i)     Creates a new raw project in the current directory
--example hardware          Installs the "hardware" sample project
--example hardware-yaml     Installs the "hardware" sample project, using YAML instead of JSON
--example shapes            Installs the "shapes" sample project
--example shapes-yaml       Installs the "shapes" sample project, using YAML instead of JSON

--force             (-f)    Forces the upload of the complete model
--run-through       (-r)    Skips watching the filesystem and serving the webapp
                            mobo will exit after completion. This might be
                            useful if mobo is triggered through other skripts.

--skip-upload               Skips uploading and deleting on the external wiki

--import <director>         Imports all files from /import/<director> to the wiki

--nuke content              Nukes all maint content wiki pages
--nuke structure            Nukes all structural wiki pages (templates, categories, ...)
--nuke custom-namespaces    Nukes all content from custom namespaces
--nuke <namespaceNumber>    Nukes the namespace of the given number


DEVELOPER CONSOLE COMMANDS
--------------------------
    --update-schemas    Generates / Updates the JSON Schema documentation (SCHEMA.md files)