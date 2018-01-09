window.onload =  function() {
	$("h4, h3").addClass("ui dividing header");
	$(".ui.dropdown").dropdown();
	$(".ui.form").form({
		fields: {
			name: {
				identifier: 'record[name]',
				rules: [
					{
						type: 'empty',
						prompt: 'This field is required'
					},
					{
						type: 'doesntContain[ ]',
						prompt: "The name can't contain any space"
					}
				]
			}
		},
		inline: true,
		on: 'blur'
	});
};