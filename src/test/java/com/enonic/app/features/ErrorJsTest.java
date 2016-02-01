package com.enonic.app.features;

import com.enonic.xp.testing.script.ScriptRunnerSupport;

public class ErrorJsTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/site/error/error-test.js";
    }
}
