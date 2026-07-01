<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" omit-xml-declaration="yes"/>

    <xsl:template match="/root">
        <xsl:value-of select=":::not-a-valid-xpath-expression:::"/>
    </xsl:template>
</xsl:stylesheet>
