import { JSX } from "react";

export default function PropertyForm():JSX.Element{
    return (
        <form>
            <label>
                Property Name:
                <input type="text" name="propertyName" />
            </label>
            <label>
                Property Value:
                <input type="text" name="propertyValue" />
            </label>
            <button type="submit">Submit</button>
        </form>
    );
}