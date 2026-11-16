package com.enonic.guide;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class ExplicitUrlSuiteTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "/lib/explicit-url-tests-test.js";
    }
}
