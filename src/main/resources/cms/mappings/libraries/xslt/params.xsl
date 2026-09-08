<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" omit-xml-declaration="yes"/>

    <xsl:template match="/root">
        <xsl:variable name="greeting" select="params/greeting"/>
        <xsl:variable name="who" select="params/who"/>
        <xsl:variable name="repeat" select="params/repeat"/>

        <div class="xslt-params">
            <h2 class="xslt-params-heading">
                <xsl:value-of select="$greeting"/>
                <xsl:text>, </xsl:text>
                <xsl:value-of select="$who"/>
                <xsl:text>!</xsl:text>
            </h2>
            <ul class="xslt-params-echoes">
                <xsl:call-template name="repeat-line">
                    <xsl:with-param name="text" select="concat($greeting, ' ', $who)"/>
                    <xsl:with-param name="times" select="$repeat"/>
                </xsl:call-template>
            </ul>
            <p class="xslt-params-summary">
                <xsl:text>Rendered </xsl:text>
                <xsl:value-of select="format-number(number($repeat), '0')"/>
                <xsl:text> line(s) for </xsl:text>
                <xsl:value-of select="$who"/>
                <xsl:text>.</xsl:text>
            </p>
        </div>
    </xsl:template>

    <xsl:template name="repeat-line">
        <xsl:param name="text"/>
        <xsl:param name="times"/>
        <xsl:if test="number($times) &gt; 0">
            <li class="xslt-params-line"><xsl:value-of select="$text"/></li>
            <xsl:call-template name="repeat-line">
                <xsl:with-param name="text" select="$text"/>
                <xsl:with-param name="times" select="number($times) - 1"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
