#
# Entry point
#
cls
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
# Generate-Folders function
#
function Generate-Folders {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$path)

    $global:foldPath = $null
    foreach($foldername in $path.split("\") ) {
        $global:foldPath += ( $foldername + "\" )
        if( !(Test-Path $global:foldPath) ) {
            New-Item -ItemType Directory -Path $global:foldPath | Out-Null
        }
    }   
}

#
# Clean-String function
#
function Clean-String {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$value)
    $value = $value -replace '[^\sa-zA-Z0-9а-яёА-ЯЁ-]*', ""
    $value = $value -replace '[\[\]]*', "" 
    $value = $value -replace '[\s]{2,}', " " 
    return $value
}   

#
# Load-FB2 function
#
function Load-FB2 {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][object]$book)

    $enc = ($book) | Get-FB2-Encoding-String | Map-FB2-Encoding-FileSystemEncoding
    if ($enc -eq "") {
        Write-Host "Empty encoding error: ", $book.FullName 
        return $null
    }
    $content = Get-Content -LiteralPath $book.FullName -Encoding $enc
    [System.Xml.XmlDocument]$fb2 = $content
    return $fb2
}

#
# Build-FB2-File-Name function
#
function Build-FB2-File-Name( [string]$title, [string]$firstName, [string]$lastName, [string]$sequenceName, [string]$sequenceNumber ) {

    [string]$fio = Format-Author-FIO -firstName $firstName -lastName $lastName

    $fio = $fio.Trim()

    $fullDir  = "$lastName\$fio"
    if ([string]::IsNullOrEmpty($sequenceName)) {} Else {
        $fullDir = "$lastName\$fio\$sequenceName"
    }
    $fullDir = "$DstPath\$fullDir"
    ( $fullDir ) | Generate-Folders

    $fileName = "$fio - $title.fb2"
    if ([string]::IsNullOrEmpty($sequenceName)) {} Else {
	$sequence = "$sequenceName $sequenceNumber"
        $sequence = $sequence.Trim()
        $fileName = "$fio - $sequence - $title.fb2"
    }
    $fullName  = "$fullDir\$fileName"
    if ((Test-Path $fullName) -eq $True) {
        $fullName = ($fullName) | Build-backup-FB2-Name
    }
    return $fullName
}

#
# Format-Author-FIO function
#
function Format-Author-FIO([string]$firstName, [string]$lastName) {
    return "$lastName $firstName"
}

#
# Format-Title function
#
function Format-Title {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$title)
    
    $TextInfo = (Get-Culture).TextInfo
    if ([string]::IsNullOrEmpty($title)) {
        $title = "Undefined Title" 
    }
    $title = $title.ToLower()
    return $TextInfo.ToTitleCase($title)
}

#
# Format-Sequence-Entity function
#
function Format-Sequence-Entity{
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$item)

    $TextInfo = (Get-Culture).TextInfo
    if ([string]::IsNullOrEmpty($item)) {
        $item = ""
    }
    $item = $item.Trim()
    return $TextInfo.ToTitleCase( $item )
}

#
# Format-Author-Name function
#
function Format-Author-Name {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$name)

    $TextInfo = (Get-Culture).TextInfo
    if ([string]::IsNullOrEmpty($name)) {
        $name = "Unknown"
    }
    $name = $name.Replace(" ", "")
    $name = $name.Trim()
    return $TextInfo.ToTitleCase( $name )
}

#
# Get-Child-Nodes function
#
function Get-Child-Nodes([System.Xml.XmlLinkedNode]$items, [string]$name) {
    $result = New-Object System.Collections.Generic.List[System.Xml.XmlLinkedNode]
    if ($items -ne $null) {
        foreach($node in $items.ChildNodes) {
            if ( $node.LocalName -eq $name ) {
                $result.Add($node)
            }
        }
    }
    return $result
}

#
# Get-Child-Node function
#
function Get-Child-Node([System.Xml.XmlLinkedNode]$items, [string]$name) {
    $result = New-Object System.Collections.Generic.List[System.Xml.XmlLinkedNode]
    if ($items -ne $null) {
        foreach($node in $items.ChildNodes) {
            if ( $node.LocalName -eq $name ) {
                $result = $node
                break
            }
        }
    }
    return $result
}

#
# Get-Node-Property function
#
function Get-Node-Property([System.Xml.XmlElement]$node, [string]$name) {
    $result = ""
    if ($node -ne $null) {
        try { 
            $result = $node.$name
        } catch { 
            $result = ""
        }
    }
    return $result
}

#
# Get-Node-Property-Text function
#
function Get-Node-Property-Text {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlLinkedNode]$node)
    return Get-Node-Property -node $node -name '#text'
}

#
# Get-Node-Attribute function
#
function Get-Node-Attribute([System.Xml.XmlLinkedNode]$node, [string]$name) {
    $result = ""
    if ($node -ne $null) {
        $attr = $node.Attributes.GetNamedItem($name)
        if ($attr -ne $null) {
            $result = $attr.'#text'
        }
    }
    return $result
}

#
# Get-Authors function
#
function Get-Authors {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlLinkedNode]$metadata)
    return Get-Child-Nodes -items $metadata -name "author"
}

#
# Get-Author-FirstName function
#
function Get-Author-FirstName {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlElement]$author)
    return Get-Node-Property -node $author -name "first-name"
}

#
# Get-Author-LastName function
#
function Get-Author-LastName {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlElement]$author)
    return Get-Node-Property -node $author -name "last-name"
}

#
# Get-Title function
#
function Get-Title {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlLinkedNode]$metadata)
    return Get-Child-Node -items $metadata -name "book-title"
}

#
# Get-Sequence function
#
function Get-Sequence {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlLinkedNode]$metadata)
    return Get-Child-Node -items $metadata -name "sequence"
}

#
# Get-Sequence-Name function
#
function Get-Sequence-Name {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlLinkedNode]$sequence)
    return Get-Node-Attribute -node $sequence -name "name"
}

#
# Get-Sequence-Number function
#
function Get-Sequence-Number {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlLinkedNode]$sequence)
    return Get-Node-Attribute -node $sequence -name "number"
}

#
# Build-backup-FB2-Name function
#
function Build-backup-FB2-Name {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][string]$name)

    $num = 0;
    $result = $name + ".copy"
    while ((Test-Path $result) -eq $True) {
        $num++;
        $result = $name + ".copy." + $num
    }
    return $result
}

#
# Save-FB2 function
#
function Save-FB2 {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlDocument]$fb2)

    [System.Xml.XmlLinkedNode]$metadata = ($fb2) | Get-FB2-Metadata 
    if ($metadata -ne $null) {
        $title          = ($metadata) | Get-Title    | Get-Node-Property-Text | Clean-String | Format-Title 
        $sequenceName   = ($metadata) | Get-Sequence | Get-Sequence-Name      | Clean-String | Format-Sequence-Entity
        $sequenceNumber = ($metadata) | Get-Sequence | Get-Sequence-Number    | Clean-String | Format-Sequence-Entity
        ($metadata) | Get-Authors | ForEach-Object -Process {
            $firstName = ($_) | Get-Author-FirstName | Format-Author-Name | Clean-String 
            $lastName  = ($_) | Get-Author-LastName  | Format-Author-Name | Clean-String 
            $fullName = Build-FB2-File-Name -title $title -firstName $firstName -lastName $lastName -sequenceName $sequenceName -sequenceNumber $sequenceNumber 
            Write-Host $fullName
            ($fb2) | Format-XML | Out-File $fullName # Save modified Loaded FB2 data as a new file
	}
    }
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
# Process-FB2-Book function
#
function Process-FB2-Book {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Object]$book)

    if (IsEmpty-FB2 ($book) ) { 
        Write-Host -msg "Empty FB2 file: " + $book.FullName 
    } Else {
        try { 
            [System.Xml.XmlDocument]$fb2 = ($book) | Load-FB2
        } catch { 
            $fb2 = $null
            Write-Host "Processing error: ", $book.FullName, $_, $_.ScriptStackTrace
        }

        if ($fb2 -ne $null)  {
            try { 
                $fb2 = Remove-Binary-Nodes -fb2 $fb2
            } catch { 
                Write-Host "Error removing binary nodes: ", $book.FullName, $_, $_.ScriptStackTrace
            }
        } else {
            Write-Host "Unknown error 1: fb2 is null: ", $book.FullName
        }


        if ($fb2 -ne $null)  {
            try { 
                ($fb2) | Save-FB2
            } catch { 
                Write-Host "Saving error: ", $book.FullName, $_, $_.ScriptStackTrace
            }
        } else {
            Write-Host "Unknown error 3: fb2 is null: ", $book.FullName
        }
    }
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
# Remove-Binary-Nodes function
#
function Remove-Binary-Nodes {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Xml.XmlDocument]$fb2)

    $remove = $fb2.FictionBook.SelectSingleNode("//binary")
    if ($remove -ne $null) {
        $remove.ParentNode.RemoveChild($remove)
    }
    $remove = $fb2.FictionBook.SelectSingleNode("//binary")
    if ($remove -ne $null) {
        $remove.ParentNode.RemoveChild($remove)
    }
    $remove = $fb2.FictionBook.SelectSingleNode("//binary")
    if ($remove -ne $null) {
        $remove.ParentNode.RemoveChild($remove)
    }
    $remove = $fb2.FictionBook.SelectSingleNode("//binary")
    if ($remove -ne $null) {
        $remove.ParentNode.RemoveChild($remove)
    }

    return $fb2
}

#
# Process-FB2-Books function
#
function Process-FB2-Books {
    [CmdletBinding()]
    Param([Parameter(ValueFromPipeline)][System.Object[]]$books)
    
    if ($books -eq $null) {
        return
    }
    if ($books.length -eq 0) {
        return
    }
    $counter = 1;
    foreach ($book in $books) {
        ($book) | Process-FB2-Book
        Write-Host -NoNewline "[ ", $counter, " / ", $books.length, " ] "
        $counter++
    }
}

#
# Initialization
#
$SrcPath = "F:\Books\Unsorted\"
$SrcPath = "F:\Books\Unsorted\backup\Абсолютное оружие\Ахманов\"
$DstPath = "F:\Books\Sorted"

#
# Collecting and processing the books
#
Write-Host "Searching books..." 
$books = Get-ChildItem -Path $SrcPath -Recurse -Filter *.fb2 
Write-Host "Found ", $books.length, " books..." 
Process-FB2-Books -books $books
