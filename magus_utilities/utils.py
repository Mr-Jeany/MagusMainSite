
def placeholders(input_string, ph_symbol="%", **kwargs):
    for ph_num in kwargs:
        input_string = input_string.replace(
            (ph_symbol + str(ph_num)),
            str(kwargs[ph_num]))

    return input_string

def multiplaceholder(input_string, placeholder, values):
    baking_output = ""
    for value in values:
        if not isinstance(value, dict):
            baking_output += str(value) + '\n'
        else:
            baking_output += dictlike_param_to_text(value)

    return input_string.replace("%%" + str(placeholder), baking_output)

def dictlike_param_to_text(param):
    baking_output = ""
    c = 0
    for value in param:
        c += 1
        baking_output += str(value) + '\n{\n'
        if isinstance(param[value], str):
            baking_output += param[value] + '\n'
        else:
            for p in param[value]:
                if not isinstance(p, dict):
                    baking_output += str(p) + '\n'
                else:
                    baking_output += dictlike_param_to_text(p)
        baking_output += "}\n"

    return baking_output