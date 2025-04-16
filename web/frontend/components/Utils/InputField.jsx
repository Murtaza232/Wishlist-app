import React from 'react'

export function InputField({ name, value, onChange, type, autoComplete, id, min, max, multiline,
    label, placeholder, required, error, helpText, prefix, suffix, marginBottom, marginTop }) {
    return (
        <div className={`Polaris-Custom-InputField ${marginTop && 'MarginTop '}  ${marginBottom && 'MarginBottom'}`}>
            {label &&
                <div className="Polaris-Labelled__LabelWrapper">
                    <div className="Polaris-Label">
                        <label htmlFor={id} className="Polaris-Label__Text">
                            <span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">
                                {label}
                            </span>
                        </label>
                    </div>
                </div>
            }

            <div className="Polaris-Connected">
                <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                    <div className={`${error ? 'Polaris-TextField--error' : ''} ${multiline ? 'Polaris-TextField--multiline' : ''} 
                    Polaris-TextField Polaris-TextField--hasValue `}>
                        {prefix && <div className="Polaris-TextField__Prefix" id="PolarisTextField1-Prefix">{prefix}</div>}
                        {multiline ?
                            <textarea
                                id={id}
                                type={type}
                                rows={multiline}
                                name={name}
                                value={value}
                                min={min}
                                max={max}
                                onChange={onChange}
                                required={required}
                                placeholder={placeholder}
                                autoComplete={autoComplete}
                                className="Polaris-TextField__Input"
                                aria-labelledby="PolarisTextField1Label"
                                aria-invalid="false"
                                aria-multiline="true"
                                style={{ height: '106px' }}
                            >
                                {value}
                            </textarea>
                            :

                            <input
                                aria-labelledby="PolarisTextField1Label"
                                aria-invalid="false"
                                className="Polaris-TextField__Input"
                                autoComplete={autoComplete}
                                id={id}
                                type={type}
                                name={name}
                                value={value}
                                min={min}
                                max={max}
                                onChange={onChange}
                                required={required}
                                placeholder={placeholder}
                            />
                        }

                        {suffix && <div className="Polaris-TextField__Suffix" id="PolarisTextField1-Suffix">{suffix}</div>}

                        <div className="Polaris-TextField__Backdrop"></div>
                    </div>
                </div>
            </div>
            {error &&
                <div className="Polaris-Labelled__Error">
                    <div id="PolarisTextField1Error" className="Polaris-InlineError">
                        <div className="Polaris-InlineError__Icon">
                            <span className="Polaris-Icon">
                                <span className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden">
                                </span>
                                <svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                    <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-9a1 1 0 0 0 2 0v-2a1 1 0 1 0-2 0v2zm0 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0z">
                                    </path>
                                </svg>
                            </span>
                        </div>{error}</div>
                </div>
            }
            {helpText &&
                <div className="Polaris-Labelled__HelpText" id="PolarisTextField1HelpText">
                    <span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
                        {helpText}
                    </span>
                </div>
            }
        </div>
    )
}
