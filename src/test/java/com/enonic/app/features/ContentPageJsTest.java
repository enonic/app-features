package com.enonic.app.features;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class ContentPageJsTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/site/pages/content/content-test.js";
    }
}
