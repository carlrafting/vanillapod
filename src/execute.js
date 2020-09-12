export default function execute(
    element,
    doRegister,
    createElement,
    attachChildren
) {
    return (
        attachChildren(
            createElement(
                doRegister(element)
            )
        )
    );
}