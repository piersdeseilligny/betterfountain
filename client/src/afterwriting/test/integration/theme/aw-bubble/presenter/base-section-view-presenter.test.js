define(function(require) {

    var BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        Section = require('theme/aw-bubble/model/section'),
        Settings = require('core/model/settings'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin'),
        ScriptModel = require('core/model/script-model'),
        Component = require('protoplast').Component;
    
    describe('BaseSectionViewPresenter', function() {

        var presenter,
            section,
            settings,
            scriptModel,
            scriptChanged,
            activated,
            deactivated,
            view;
        
        var Presenter = BaseSectionViewPresenter.extend({
            
            activate: function() {
                BaseSectionViewPresenter.activate.call(this);
                activated();
            },
            
            deactivate: function() {
                BaseSectionViewPresenter.deactivate.call(this);
                deactivated();
            },
            
            _scriptChanged: function() {
                scriptChanged();
            }
            
        });

        beforeEach(function() {
            section = Section.create();

            settings = Settings.create();

            scriptModel = ScriptModel.create();
            scriptModel.settings = settings;

            view = Component.extend([SectionViewMixin]).create();
            view.section = section;

            presenter = Presenter.create();
            presenter.scriptModel = scriptModel;
            presenter.view = view;

            activated = sinon.stub();
            deactivated = sinon.stub();
            scriptChanged = sinon.stub();
        });

        it('GIVEN section is inactive WHEN presenter is initialised THEN no hooks are called', function() {
            // GIVEN
            section.isActive = false;

            // WHEN
            presenter.init();

            // THEN
            sinon.assert.notCalled(activated);
            sinon.assert.notCalled(deactivated);
            sinon.assert.notCalled(scriptChanged);
        });

        it('GIVEN section is active WHEN presenter is initialised THEN only activate hook is called', function() {
            // GIVEN
            section.isActive = true;

            // WHEN
            presenter.init();

            // THEN
            sinon.assert.calledOnce(activated);
            sinon.assert.notCalled(deactivated);
            sinon.assert.notCalled(scriptChanged);
        });

        it('GIVEN section is active WHEN presenter is initialised AND section becomes inactive THEN activate and deactivte hooks are called', function() {
            // GIVEN
            section.isActive = true;

            // WHEN
            presenter.init();

            // AND
            section.isActive = false;

            // THEN
            sinon.assert.calledOnce(activated);
            sinon.assert.calledOnce(deactivated);
            sinon.assert.notCalled(scriptChanged);
        });

        it('GIVEN section is active WHEN presenter is initialised AND script changes THEN scriptChanged hook is called', function() {
            // GIVEN
            section.isActive = true;

            // WHEN
            presenter.init();

            // AND
            scriptModel.script = '123';

            // THEN
            sinon.assert.calledOnce(activated);
            sinon.assert.notCalled(deactivated);
            sinon.assert.calledOnce(scriptChanged);
        });

        it('GIVEN section is active WHEN presenter is initialised AND section becomes inactive AND script changes THEN scriptChanged hook is not called', function() {
            // GIVEN
            section.isActive = true;

            // WHEN
            presenter.init();

            // AND
            section.isActive = false;

            // AND
            scriptModel.script = 'test';

            // THEN
            sinon.assert.notCalled(scriptChanged);
        });

    });
    
});
