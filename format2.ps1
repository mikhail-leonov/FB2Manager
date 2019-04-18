#
# Script parameter
#
param( [string]$fb2bookDir = "" )
Set-StrictMode -Version Latest

#
# IsEmpty-FB2 function
#
function IsEmpty-FB2 ([object]$book) {
    $result = $false
    $content = Get-Content -LiteralPath $book.FullName -TotalCount 1
    if ([string]::IsNullOrEmpty($content)) {
        $result = $true
    }
    return $result
}

#
# Get-FB2-Encoding-String function
#
function Get-FB2-Encoding-String {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][object]$book)
    
    $result = ""
    $xmlHeader = Get-Content -LiteralPath $book.FullName -TotalCount 1

    $xmlHeader = $xmlHeader.Replace( "'", '"')
    $xmlHeader = $xmlHeader.Replace( "'", '"')
    $xmlHeader = $xmlHeader.Replace( "'", '"')
    $xmlHeader = $xmlHeader.Replace( "'", '"')

    $pattern = '\w*\=\"\w*(.)\w*\"'
    $params = $xmlHeader | Select-String $pattern -AllMatches
    foreach($param in $params.Matches) {
        $hash = ConvertFrom-StringData -StringData $param
        if ( $hash.ContainsKey("encoding") ) {
            $result = $hash.encoding
            break
        }
    }
    return $result.ToLower().Replace('"', "")
}

#
# Map-FB2-Encoding-FileSystemEncoding function
#
function Map-FB2-Encoding-FileSystemEncoding {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$encoding)
    
    $result = ""
    if ($encoding -eq "cp866"	  	) { $result = "Default" }
    if ($encoding -eq "windows-1251"  	) { $result = "Default" }
    if ($encoding -eq "utf-7" 	  	) { $result = "UTF7" 	}
    if ($encoding -eq "utf-8" 	  	) { $result = "UTF8" 	}
    return $result
}

#
# Load-FB2 function
#
function Load-FB2( [object]$book, [string]$enc ) { 
    if ($enc -eq "") {
        Write-Host "Empty encoding error: ", $book.FullName 
        return $null
    }
    $content = Get-Content -LiteralPath $book.FullName -Encoding $enc
    [System.Xml.XmlDocument]$fb2 = $content
    return $fb2
}

#
# Format-XML
#
function Format-XML {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][xml]$xml)
    
    $Indent = 4
    $StringWriter = New-Object System.IO.StringWriter 
    $XmlWriter = New-Object System.XMl.XmlTextWriter $StringWriter 
    $xmlWriter.Formatting = "indented" 
    $xmlWriter.Indentation = $Indent 
    $xml.WriteContentTo($XmlWriter) 
    $XmlWriter.Flush() 
    $StringWriter.Flush() 
    Write-Output $StringWriter.ToString() 
}

#
# Collecting and processing the books
#
if ($fb2bookDir -eq "" ) {
    Write-Host "No FB2 file name parameter"
    return
}

Write-Host "Loading $fb2bookDir"

If (Test-Path -LiteralPath "$fb2bookDir") {} else {
    Write-Host "FB2 file name is not exists"
    return
}


$books = Get-ChildItem -Path $fb2bookDir -Recurse -Filter *.fb2

foreach ($book in $books) {
    if (IsEmpty-FB2 ($book) ) { } Else {
        $enc = ($book) | Get-FB2-Encoding-String | Map-FB2-Encoding-FileSystemEncoding
        try { 
            [System.Xml.XmlDocument]$fb2 = Load-FB2 -book $book -enc $enc
            Write-Host "FB2 book Loaded OK"

            try { 
                Write-Host "Saving XML book file"
                ($fb2) | Format-XML | Out-File $book.FullName
                Write-Host "FB2 book file saved"
            } catch { 
                Write-Host "Formatting FB2 book error: ", $book.FullName, $_, $_.ScriptStackTrace
            }

        } catch { 
            Write-Host "Reading FB2 book error. Invalid XML: ", $book.FullName, $_, $_.ScriptStackTrace
        }
    }
}    