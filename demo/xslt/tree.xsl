<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="tree">
	<xsl:param name="indent" />
    <xsl:for-each select="./*">
        <xsl:sort order="descending" select="count(./*)"/>
        <div class="tree-item">
            <xsl:value-of select="$indent"/> <xsl:value-of select="@name"/>
            <xsl:if test="count(./*) > 0">
                <div class="item-children">
                    <xsl:call-template name="tree">
                      <xsl:with-param name="indent"><xsl:value-of select="$indent"/>&#160;&#160;</xsl:with-param>
                    </xsl:call-template>
                </div>
            </xsl:if>
        </div>
    </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
