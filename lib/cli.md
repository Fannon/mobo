ABOUT MOBO
----------
Mobo is a command line toolset that helps building Semantic MediaWiki structure in an agile, model driven engineering (MDE) way.

For documentation please head over to: https://github.com/Fannon/mobo

CONSOLE COMMANDS
----------------

-v  --version           Display version
-h  --help              Display help text
-s  --settings          Displays current settings
                        Includes inherited and calculated settings

-u  --update            Updates the current project templates with the latest mobo default templates
                        This might be necessary if new features are introduced
                        Creates a Backup from your current templates first.

-i  --init              Creates a new raw project in the current directory
    --example shapes    Creates a new "shapes" sample project

-f  --force             Forces the upload of the complete model
-r  --run-through       Skips watching the filesystem and serving the webapp
                        mobo will exit after completion. This might be
                        useful if mobo is triggered through other skripts.

    --skip-upload       Skips the upload (and deletion) to the wiki


DEVELOPER CONSOLE COMMANDS
--------------------------
    --update-schemas    Generates / Updates the JSON Schema documentation (SCHEMA.md files)