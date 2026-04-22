@echo off

set SRC=D:\Projects\Books\books\
set DEST=D:\Projects\Books\upload\

echo Copying recursively...

xcopy "%SRC%*" "%DEST%" /E /I /Y

