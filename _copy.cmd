@echo off

set SRC=D:\Data\Books\unsorted\
set DEST=D:\Projects\Books\upload\

echo Copying recursively...

xcopy "%SRC%*" "%DEST%" /E /I /Y

