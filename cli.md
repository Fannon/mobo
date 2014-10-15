ABOUT MOBO
----------
mobo is a Semantic MediaWiki Modeling Bot.

You will find more detailed documentation in the various README.md files
that will be created as part of the init project.

Further documentation can be found at: https://github.com/Fannon/mobo

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