#
# Entry point
#
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
    
    [Cmdletbinding()]
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
    return Get-Content -LiteralPath $book.FullName -Encoding $enc
}

#
# Print-Error function
#
function Print-Empty-Tag-Error([string]$code, [string]$path, [string]$msg) {
    Write-Host "powershell F:\Books\format.ps1 '$path' $msg"
}

#
# Get-FB2-Metadata function
#
function Get-FB2-Metadata {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlDocument]$fb2)

    $metadata = $null
    foreach($node in $fb2.ChildNodes) {
        if ( $node.Name -eq "FictionBook" ) {
            foreach($node2 in $node.ChildNodes) {
                if ( $node2.Name -eq "description" ) {
                    foreach($node3 in $node2.ChildNodes) {
                        if ( $node3.Name -eq "title-info" ) {
                            $metadata = $node3
                        }
                    }
                }
            }
        }
    }
    return $metadata
}

    
#
# Validate-FB2 function
#
function Validate-FB2([string]$path, [string]$content) {
    
    $content = $content.ToLower()

    try { 
        [System.Xml.XmlDocument]$fb2 = $content
    } catch { 
	Print-Empty-Tag-Error -code "0100" -path $path -msg $_
        return
    }
    
    try { 
        $metadata = ( $fb2 ) | Get-FB2-Metadata
    } catch { 
	Print-Empty-Tag-Error -code "0101" -path $path -msg $_
        return
    }
    
    try { 
        # Remove translator node
        $remove = $fb2.FictionBook.SelectSingleNode("//translator")
        if ($remove -ne $null) {
            $remove.ParentNode.RemoveChild($remove)
        }
    } catch { 
	Print-Empty-Tag-Error -code "0102" -path $path -msg "Error deleteing translator subnode"
        return
    }


    try { 
        $metadata = $metadata.InnerXML
    } catch { 
	Print-Empty-Tag-Error -code "0110" -path $path -msg $_
        return
    }

    if ($metadata -eq $null)  {
        Print-Empty-Tag-Error -code "0111" -path $book.FullName -msg "Metadata Empty"
        return
    }
    if ($metadata.length -eq 0)  {
        Print-Empty-Tag-Error -code "0112" -path $book.FullName -msg "Metadata Empty"
        return
    }
    if ($metadata.Trim().length -eq 0)  {
        Print-Empty-Tag-Error -code "0113" -path $book.FullName -msg "Metadata Empty"
        return
    }
    

    
    
    if($metadata.Contains('<first-name/>')) {
	Print-Empty-Tag-Error -code "0020" -path $path -msg "Empty author first name tag"
        return
    }
    if($metadata.Contains('<first-name />')) {
	Print-Empty-Tag-Error -code "0021" -path $path -msg "Empty author first name tag"
        return
    }
    if($metadata.Contains('<first-name></first-name>')) {
	Print-Empty-Tag-Error -code "0022" -path $path -msg "Empty author first name tag"
        return
    }
    if($metadata.Contains('<first-name> </first-name>')) {
	Print-Empty-Tag-Error -code "0023" -path $path -msg "Empty author first name tag"
        return
    }



    if($metadata.Contains('<last-name/>')) {
	Print-Empty-Tag-Error -code "0030" -path $path -msg "Empty author last name tag"
        return
    }
    if($metadata.Contains('<last-name />')) {
	Print-Empty-Tag-Error -code "0031" -path $path -msg "Empty author last name tag"
        return
    }
    if($metadata.Contains('<last-name></last-name>')) {
	Print-Empty-Tag-Error -code "0032" -path $path -msg "Empty author last name tag"
        return
    }
    if($metadata.Contains('<last-name> </last-name>')) {
	Print-Empty-Tag-Error -code "0033" -path $path -msg "Empty author last name tag"
        return
    }





    if($metadata.Contains('<book-title/>')) {
	Print-Empty-Tag-Error -code "0040" -path $path -msg "Empty book title tag"
        return
    }
    if($metadata.Contains('<book-title />')) {
	Print-Empty-Tag-Error -code "0041" -path $path -msg "Empty book title tag"
        return
    }
    if($metadata.Contains('<book-title></book-title>')) {
	Print-Empty-Tag-Error -code "0042" -path $path -msg "Empty book title tag"
        return
    }
    if($metadata.Contains('<book-title>< /book-title>')) {
	Print-Empty-Tag-Error -code "0043" -path $path -msg "Empty book title tag"
        return
    }




}

#
# Process-Book-List function
#
function Process-Book-List( [System.Object[]]$books ) {
    if ($books -eq $null) {
        return
    }
    if ($books.length -eq 0) {
        return
    }
    foreach ($book in $books) {
        if (IsEmpty-FB2 ($book) ) { } Else {

            #Write-Host $book.FullName

            $enc = ($book) | Get-FB2-Encoding-String | Map-FB2-Encoding-FileSystemEncoding
            if ($enc -eq $null) {  
		Print-Empty-Tag-Error -code "0001" -path $book.FullName -msg "Encoding Empty"
                continue
            }
            if ($enc.length -eq 0) {  
		Print-Empty-Tag-Error -code "0002" -path $book.FullName -msg "Encoding Empty"
                continue
            }
            if ($enc.Trim().length -eq 0)  {
		Print-Empty-Tag-Error -code "0003" -path $book.FullName -msg "Encoding Empty"
                continue
            }
            try { 
                $content = Load-FB2 -book $book -enc $enc
            } catch { 
		Print-Empty-Tag-Error -code "0004" -path $book.FullName -msg $_
                continue
            }

            if ($content -eq $null)  {
		Print-Empty-Tag-Error -code "0005" -path $book.FullName -msg "Content Empty"
                continue
            }
            if ($content.length -eq 0)  {
		Print-Empty-Tag-Error -code "0006" -path $book.FullName -msg "Content Empty"
                continue
            }
            if ($content.Trim().length -eq 0)  {
		Print-Empty-Tag-Error -code "0007" -path $book.FullName -msg "Content Empty"
                continue
            }
            try { 
                Validate-FB2 -path $book.FullName -content $content
            } catch { 
		Print-Empty-Tag-Error -code "0008" -path $book.FullName -msg $_
                continue
            }
        }
    }
}

#
# Initialization
#
$SrcPath = "F:\Books\Unsorted\"
#$SrcPath = "F:\Books\Unsorted\Process\reverse\Спасти Колчака (Романов Герман)"
#
# Collecting and processing the books
#
$books = Get-ChildItem -Path $SrcPath -Recurse -Filter *.fb2
Process-Book-List -books $books
